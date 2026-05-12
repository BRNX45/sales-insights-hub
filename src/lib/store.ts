import { supabase } from "@/integrations/supabase/client";
import type { Role } from "./role";

const isBrowser = typeof window !== "undefined";

export type StoredUser = {
  id: string;
  fullName: string;
  email: string;
  role: Role;
  provider: "email" | "google";
  createdAt: string;
};
export type StoredSale = {
  id: string; date: string; customerId: string; productId: string;
  ownerId: string; approved: boolean;
};
export type Product = { id: string; name: string; price: number; category: string };
export type Customer = { id: string; name: string; email: string };
export type InventoryRow = { productId: string; stock: number };
export type ActivityEntry = { id: string; at: string; actorId: string; actorEmail: string; action: string };
export type Settings = { companyName: string; maintenance: boolean; allowSignups: boolean; passwordPolicy: string };

// In-memory cache hydrated from Supabase
const cache = {
  users: [] as StoredUser[],
  sales: [] as StoredSale[],
  products: [] as Product[],
  customers: [] as Customer[],
  inventory: [] as InventoryRow[],
  activity: [] as ActivityEntry[],
  settings: { companyName: "SalesOS", maintenance: false, allowSignups: true, passwordPolicy: "Min 6 chars" } as Settings,
};

export const uid = () =>
  (isBrowser && "crypto" in window && "randomUUID" in window.crypto
    ? window.crypto.randomUUID()
    : `id_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`);

let hydratePromise: Promise<void> | null = null;
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((l) => l());
export const subscribeStore = (l: () => void) => { listeners.add(l); return () => listeners.delete(l); };

async function hydrate() {
  const [pr, cu, inv, sa, st, ro, prof, ac] = await Promise.all([
    supabase.from("products").select("*"),
    supabase.from("customers").select("*"),
    supabase.from("inventory").select("*"),
    supabase.from("sales").select("*").order("date", { ascending: true }),
    supabase.from("settings").select("*").eq("id", 1).maybeSingle(),
    supabase.from("user_roles").select("*"),
    supabase.from("profiles").select("*"),
    supabase.from("activity_log").select("*").order("at", { ascending: false }).limit(200),
  ]);
  cache.products = (pr.data ?? []).map((p: any) => ({ id: p.id, name: p.name, price: Number(p.price), category: p.category }));
  cache.customers = (cu.data ?? []).map((c: any) => ({ id: c.id, name: c.name, email: c.email }));
  cache.inventory = (inv.data ?? []).map((i: any) => ({ productId: i.product_id, stock: i.stock }));
  cache.sales = (sa.data ?? []).map((s: any) => ({
    id: s.id, date: s.date, customerId: s.customer_id, productId: s.product_id,
    ownerId: s.owner_id ?? "", approved: s.approved,
  }));
  if (st.data) cache.settings = {
    companyName: st.data.company_name, maintenance: st.data.maintenance,
    allowSignups: st.data.allow_signups, passwordPolicy: st.data.password_policy,
  };
  const roleMap = new Map<string, Role>();
  (ro.data ?? []).forEach((r: any) => {
    const cur = roleMap.get(r.user_id);
    const rank = { user: 1, admin: 2, super_admin: 3 } as const;
    if (!cur || rank[r.role as Role] > rank[cur]) roleMap.set(r.user_id, r.role);
  });
  cache.users = (prof.data ?? []).map((p: any) => ({
    id: p.id, fullName: p.full_name, email: p.email,
    role: roleMap.get(p.id) ?? "user", provider: "email",
    createdAt: p.created_at,
  }));
  cache.activity = (ac.data ?? []).map((a: any) => ({
    id: a.id, at: a.at, actorId: a.actor_id ?? "", actorEmail: a.actor_email, action: a.action,
  }));
  notify();
}

export function ensureSeeded(): Promise<void> {
  if (!isBrowser) return Promise.resolve();
  if (!hydratePromise) hydratePromise = hydrate().catch((e) => { console.error("Hydrate failed", e); });
  return hydratePromise;
}

// Users / session — auth.tsx handles these now, but keep stubs
export const getUsers = () => cache.users;
export const setUsers = async (u: StoredUser[]) => {
  cache.users = u; notify();
  // Sync role changes only (profiles managed via signup trigger)
};
export const getSession = () => null;
export const setSession = () => {};

// Sales
export const getSales = () => cache.sales;
export const setSales = async (s: StoredSale[]) => {
  const prev = cache.sales;
  cache.sales = s; notify();
  const prevIds = new Set(prev.map((x) => x.id));
  const nextIds = new Set(s.map((x) => x.id));
  const added = s.filter((x) => !prevIds.has(x.id));
  const removed = prev.filter((x) => !nextIds.has(x.id));
  const updated = s.filter((x) => {
    const p = prev.find((q) => q.id === x.id);
    return p && (p.approved !== x.approved || p.date !== x.date || p.customerId !== x.customerId || p.productId !== x.productId);
  });
  for (const r of removed) await supabase.from("sales").delete().eq("id", r.id);
  for (const a of added) await supabase.from("sales").insert({
    id: a.id, date: a.date, customer_id: a.customerId, product_id: a.productId,
    owner_id: a.ownerId || null, approved: a.approved,
  });
  for (const u of updated) await supabase.from("sales").update({
    date: u.date, customer_id: u.customerId, product_id: u.productId, approved: u.approved,
  }).eq("id", u.id);
};

// Products
export const getProducts = () => cache.products;
export const setProducts = async (v: Product[]) => {
  cache.products = v; notify();
  await supabase.from("products").upsert(v.map((p) => ({ id: p.id, name: p.name, price: p.price, category: p.category })));
};

// Customers
export const getCustomers = () => cache.customers;
export const setCustomers = async (v: Customer[]) => {
  cache.customers = v; notify();
  await supabase.from("customers").upsert(v);
};

// Inventory
export const getInventory = () => cache.inventory;
export const setInventory = async (v: InventoryRow[]) => {
  cache.inventory = v; notify();
  await supabase.from("inventory").upsert(v.map((i) => ({ product_id: i.productId, stock: i.stock })));
};

// Activity
export const getActivity = () => cache.activity;
export const logActivity = async (actor: StoredUser, action: string) => {
  const entry: ActivityEntry = {
    id: uid(), at: new Date().toISOString(),
    actorId: actor.id, actorEmail: actor.email, action,
  };
  cache.activity = [entry, ...cache.activity].slice(0, 200); notify();
  await supabase.from("activity_log").insert({
    actor_id: actor.id, actor_email: actor.email, action,
  });
};

// Settings
export const getSettings = () => cache.settings;
export const setSettings = async (v: Settings) => {
  cache.settings = v; notify();
  await supabase.from("settings").update({
    company_name: v.companyName, maintenance: v.maintenance,
    allow_signups: v.allowSignups, password_policy: v.passwordPolicy,
  }).eq("id", 1);
};

export const STORE_KEYS = {};
