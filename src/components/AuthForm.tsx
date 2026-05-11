import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const { login, signup, googleSignIn } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const fn = fullName.trim();
    const em = email.trim();
    if (!fn || !em) return setError("Full name and email are required.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) return setError("Enter a valid email.");
    try {
      if (mode === "login") login(fn, em);
      else signup(fn, em);
      navigate({ to: "/dashboard" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  };

  const google = () => {
    const fn = fullName.trim() || "Google User";
    const em =
      email.trim() ||
      `${fn.toLowerCase().replace(/\s+/g, ".")}.${Math.random().toString(36).slice(2, 5)}@gmail.com`;
    googleSignIn(fn, em);
    navigate({ to: "/dashboard" });
  };

  return (
    <div className="min-h-screen bg-background text-foreground grid place-items-center px-4">
      <div className="w-full max-w-sm flex flex-col gap-5">
        <div>
          <Link to="/" className="text-xs text-muted-foreground">
            ← Back
          </Link>
          <h1 className="text-2xl font-bold tracking-tight mt-2">
            {mode === "login" ? "Log in to SalesOS" : "Create your account"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            No password needed — just your name and email.
          </p>
        </div>

        <button
          type="button"
          onClick={google}
          className="flex items-center justify-center gap-2 rounded-md border border-border bg-card px-4 py-2.5 text-sm font-medium hover:bg-accent"
        >
          <GoogleIcon />
          Continue with Google
        </button>

        <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-muted-foreground">
          <div className="h-px flex-1 bg-border" /> or <div className="h-px flex-1 bg-border" />
        </div>

        <form onSubmit={submit} className="flex flex-col gap-3">
          <label className="flex flex-col gap-1 text-xs">
            <span className="text-muted-foreground">Full name</span>
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="rounded-md border border-border bg-background px-3 py-2 text-sm"
              placeholder="Jane Doe"
              autoComplete="name"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs">
            <span className="text-muted-foreground">Email</span>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              className="rounded-md border border-border bg-background px-3 py-2 text-sm"
              placeholder="jane@example.com"
              autoComplete="email"
            />
          </label>
          {error && <p className="text-xs text-destructive">{error}</p>}
          <button
            type="submit"
            className="rounded-md bg-primary text-primary-foreground px-4 py-2.5 text-sm font-medium hover:bg-primary/90"
          >
            {mode === "login" ? "Log in" : "Create account"}
          </button>
        </form>

        <p className="text-xs text-muted-foreground text-center">
          {mode === "login" ? (
            <>
              No account?{" "}
              <Link to="/signup" className="text-primary underline">
                Sign up
              </Link>
            </>
          ) : (
            <>
              Already have one?{" "}
              <Link to="/login" className="text-primary underline">
                Log in
              </Link>
            </>
          )}
        </p>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden>
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3C33.7 32.4 29.3 35.5 24 35.5c-6.3 0-11.5-5.2-11.5-11.5S17.7 12.5 24 12.5c2.9 0 5.6 1.1 7.6 2.9l5.7-5.7C33.8 6.4 29.1 4.5 24 4.5 13.2 4.5 4.5 13.2 4.5 24S13.2 43.5 24 43.5c11 0 19.5-8 19.5-19.5 0-1.3-.1-2.3-.4-3.5z"
      />
      <path
        fill="#FF3D00"
        d="M6.3 14.7l6.6 4.8C14.6 16 18.9 12.5 24 12.5c2.9 0 5.6 1.1 7.6 2.9l5.7-5.7C33.8 6.4 29.1 4.5 24 4.5 16.3 4.5 9.7 8.9 6.3 14.7z"
      />
      <path
        fill="#4CAF50"
        d="M24 43.5c5 0 9.6-1.9 13.1-5l-6-5c-2 1.4-4.4 2.2-7.1 2.2-5.3 0-9.7-3.1-11.3-7.5l-6.5 5C9.6 39.5 16.2 43.5 24 43.5z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.3 4.1-4.2 5.5l6 5c-.4.4 6.4-4.7 6.4-14.5 0-1.3-.1-2.3-.4-3.5z"
      />
    </svg>
  );
}