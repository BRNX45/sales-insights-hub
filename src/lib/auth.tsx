import { createContext, useContext, useEffect, useState, useSyncExternalStore, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ensureSeeded, getUsers, logActivity, subscribeStore, type StoredUser } from "./store";
import type { Role } from "./role";

type AuthCtx = {
  user: StoredUser | null;
  role: Role;
  ready: boolean;
  login: (email: string, password: string) => Promise<StoredUser>;
  signup: (fullName: string, email: string, password: string) => Promise<StoredUser>;
  googleSignIn: () => Promise<void>;
  logout: () => Promise<void>;
  setRole: (r: Role) => void;
  updateProfile: (patch: Partial<Pick<StoredUser, "fullName" | "email">>) => Promise<void>;
  refresh: () => void;
};

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null);
  const [impersonated, setImpersonated] = useState<Role | null>(null);
  const [ready, setReady] = useState(false);
  const users = useSyncExternalStore(
    (l) => subscribeStore(l),
    () => getUsers(),
    () => [],
  );

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(async ({ data }) => {
      if (!mounted) return;
      setUserId(data.session?.user.id ?? null);
      await ensureSeeded();
      if (mounted) setReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange(async (_e, session) => {
      setUserId(session?.user.id ?? null);
      // Re-hydrate on auth change so new profile/role data is visible
      await ensureSeeded();
    });
    return () => { mounted = false; sub.subscription.unsubscribe(); };
  }, []);

  const user = userId ? users.find((u) => u.id === userId) ?? null : null;
  const role: Role = impersonated ?? user?.role ?? "user";

  const login = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    await ensureSeeded();
    const u = getUsers().find((x) => x.id === data.user!.id)!;
    if (u) logActivity(u, "Logged in");
    return u;
  };
  const signup = async (fullName: string, email: string, password: string) => {
    const redirect = `${window.location.origin}/`;
    const { data, error } = await supabase.auth.signUp({
      email, password,
      options: { data: { full_name: fullName }, emailRedirectTo: redirect },
    });
    if (error) throw error;
    await new Promise((r) => setTimeout(r, 400)); // let trigger fire
    await ensureSeeded();
    const u = getUsers().find((x) => x.id === data.user!.id);
    if (u) logActivity(u, "Signed up");
    return u!;
  };
  const googleSignIn = async () => {
    const { lovable } = await import("@/integrations/lovable/index");
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (result.error) throw result.error;
  };
  const logout = async () => {
    if (user) await logActivity(user, "Logged out");
    await supabase.auth.signOut();
    setImpersonated(null);
  };
  const updateProfile = async (patch: Partial<Pick<StoredUser, "fullName" | "email">>) => {
    if (!user) return;
    await supabase.from("profiles").update({
      full_name: patch.fullName ?? user.fullName,
      email: patch.email ?? user.email,
    }).eq("id", user.id);
    if (patch.email && patch.email !== user.email) {
      await supabase.auth.updateUser({ email: patch.email });
    }
    await logActivity(user, "Updated profile");
    await ensureSeeded();
  };

  return (
    <Ctx.Provider value={{
      user, role, ready, login, signup, googleSignIn, logout,
      setRole: setImpersonated, updateProfile, refresh: () => ensureSeeded(),
    }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAuth must be used inside AuthProvider");
  return c;
}
