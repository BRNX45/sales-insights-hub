import { SALES as SEED_SALES } from "@/data/sales";
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
  id: string;
  date: string;
  customerId: string;
  productId: string;
  ownerId: string;
  approved: boolean;
};

export type Product = { id: string; name: string; price: number; category: string };
export type Customer = { id: string; name: string; email: string };
export type InventoryRow = { productId: string; stock: number };
export type ActivityEntry = {
  id: string;
  at: string;
  actorId: string;
  actorEmail: string;
  action: string;
};
export type Settings = {
  companyName: string;
  maintenance: boolean;
  allowSignups: boolean;
  passwordPolicy: string;
};

const K = {
  users: "salesos.users",
  session: "salesos.session",
  sales: "salesos.sales",
  products: "salesos.products",
  customers: "salesos.customers",
  inventory: "salesos.inventory",
  activity: "salesos.activity",
  settings: "salesos.settings",
  seeded: "salesos.seeded",
};

function read<T>(key: string, fallback: T): T {
  if (!isBrowser) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
function write<T>(key: string, value: T) {
  if (!isBrowser) return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

export const uid = () =>
  (isBrowser && "crypto" in window && "randomUUID" in window.crypto
    ? window.crypto.randomUUID()
    : `id_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`);

// ---------- Seeding ----------
const DEMO_OWNER_ID = "seed-legacy-owner";

export function ensureSeeded() {
  if (!isBrowser) return;
  if (window.localStorage.getItem(K.seeded) === "1") return;

  // Seed legacy owner user (so the 124 historical sales have an owner)
  const users: StoredUser[] = read(K.users, []);
  if (!users.find((u) => u.id === DEMO_OWNER_ID)) {
    users.push({
      id: DEMO_OWNER_ID,
      fullName: "Legacy Records",
      email: "legacy@salesos.local",
      role: "user",
      provider: "email",
      createdAt: "2010-01-01T00:00:00Z",
    });
    write(K.users, users);
  }

  // Seed sales
  const sales: StoredSale[] = SEED_SALES.map((s) => ({
    ...s,
    ownerId: DEMO_OWNER_ID,
    approved: true,
  }));
  write(K.sales, sales);

  // Seed products from unique product codes
  const productIds = Array.from(new Set(SEED_SALES.map((s) => s.productId))).sort();
  const products: Product[] = productIds.map((id, i) => ({
    id,
    name: `Product ${id}`,
    price: 50 + ((i * 13) % 450),
    category: ["Hardware", "Software", "Services", "Accessories"][i % 4],
  }));
  write(K.products, products);

  // Seed customers
  const customerIds = Array.from(new Set(SEED_SALES.map((s) => s.customerId))).sort();
  const customers: Customer[] = customerIds.map((id) => ({
    id,
    name: `Customer ${id}`,
    email: `${id.toLowerCase()}@example.com`,
  }));
  write(K.customers, customers);

  // Seed inventory
  const inventory: InventoryRow[] = products.map((p) => ({
    productId: p.id,
    stock: 20 + Math.floor(Math.random() * 200),
  }));
  write(K.inventory, inventory);

  write(K.settings, {
    companyName: "SalesOS Demo",
    maintenance: false,
    allowSignups: true,
    passwordPolicy: "None (demo mode — email-only login)",
  } satisfies Settings);

  write(K.activity, [] satisfies ActivityEntry[]);
  window.localStorage.setItem(K.seeded, "1");
}

// ---------- Users ----------
export const getUsers = () => read<StoredUser[]>(K.users, []);
export const setUsers = (u: StoredUser[]) => write(K.users, u);

export const getSession = () => read<{ userId: string } | null>(K.session, null);
export const setSession = (s: { userId: string } | null) => {
  if (s) write(K.session, s);
  else if (isBrowser) window.localStorage.removeItem(K.session);
};

// ---------- Sales ----------
export const getSales = () => read<StoredSale[]>(K.sales, []);
export const setSales = (s: StoredSale[]) => write(K.sales, s);

// ---------- Products / Customers / Inventory ----------
export const getProducts = () => read<Product[]>(K.products, []);
export const setProducts = (v: Product[]) => write(K.products, v);
export const getCustomers = () => read<Customer[]>(K.customers, []);
export const setCustomers = (v: Customer[]) => write(K.customers, v);
export const getInventory = () => read<InventoryRow[]>(K.inventory, []);
export const setInventory = (v: InventoryRow[]) => write(K.inventory, v);

// ---------- Activity ----------
export const getActivity = () => read<ActivityEntry[]>(K.activity, []);
export const logActivity = (actor: StoredUser, action: string) => {
  const list = getActivity();
  list.unshift({
    id: uid(),
    at: new Date().toISOString(),
    actorId: actor.id,
    actorEmail: actor.email,
    action,
  });
  write(K.activity, list.slice(0, 200));
};

// ---------- Settings ----------
export const getSettings = (): Settings =>
  read<Settings>(K.settings, {
    companyName: "SalesOS Demo",
    maintenance: false,
    allowSignups: true,
    passwordPolicy: "None (demo mode — email-only login)",
  });
export const setSettings = (v: Settings) => write(K.settings, v);

export const STORE_KEYS = K;