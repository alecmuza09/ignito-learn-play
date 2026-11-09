import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useT } from "@/lib/i18n";
import { Companion } from "@/components/companion/Companion";
import type { CompanionState } from "@/components/companion/Companion";

const T = {
  es: {
    login: "Entrar",
    signup: "Crear cuenta",
    welcome: "¡Qué bueno verte!",
    welcomeSub: "Entra para continuar la aventura de tu familia.",
    create: "Crea tu cuenta familiar",
    createSub: "Una cuenta para ti y todos los que aprenden en casa: niños y adultos.",
    name: "Tu nombre",
    email: "Correo",
    password: "Contraseña",
    pwHint: "Mínimo 8 caracteres",
    go: "Entrar",
    goSignup: "Crear cuenta",
    working: "Un momento…",
    noAccount: "¿No tienes cuenta?",
    haveAccount: "¿Ya tienes cuenta?",
    checkEmail: "Te enviamos un correo para confirmar tu cuenta. Ábrelo y vuelve aquí para entrar.",
    suspended: "Esta cuenta está suspendida. Contacta al administrador.",
    forgot: "¿Olvidaste tu contraseña?",
    resetSent: "Si el correo existe, te enviamos un enlace para cambiar la contraseña.",
  },
  en: {
    login: "Sign in",
    signup: "Create account",
    welcome: "Great to see you!",
    welcomeSub: "Sign in to continue your family's adventure.",
    create: "Create your family account",
    createSub: "One account for you and everyone learning at home: kids and adults.",
    name: "Your name",
    email: "Email",
    password: "Password",
    pwHint: "At least 8 characters",
    go: "Sign in",
    goSignup: "Create account",
    working: "One moment…",
    noAccount: "No account yet?",
    haveAccount: "Already have an account?",
    checkEmail: "We sent you an email to confirm your account. Open it and come back to sign in.",
    suspended: "This account is suspended. Contact the administrator.",
    forgot: "Forgot your password?",
    resetSent: "If that email exists, we sent you a link to reset your password.",
  },
} as const;

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Entrar · IGNOTO" }] }),
  validateSearch: (s: Record<string, unknown>): { suspendida?: number } =>
    s.suspendida ? { suspendida: 1 } : {},
  component: AuthPage,
});

function AuthPage() {
  const t = useT(T);
  const nav = useNavigate();
  const { session, ready } = useAuth();
  const { suspendida } = Route.useSearch();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(suspendida ? t.suspended : null);
  const [notice, setNotice] = useState<string | null>(null);
  const [mood, setMood] = useState<CompanionState>("idle");

  useEffect(() => {
    if (ready && session) nav({ to: "/familia" });
  }, [ready, session, nav]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setNotice(null);
    setMood("thinking");
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { display_name: name.trim() },
            emailRedirectTo: `${window.location.origin}/familia`,
          },
        });
        if (error) throw error;
        if (!data.session) setNotice(t.checkEmail);
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
      setMood("celebrate");
    } catch (err) {
      setMood("sad");
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  async function forgot() {
    if (!email) return;
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth`,
    });
    setNotice(t.resetSent);
  }

  return (
    <main className="min-h-[calc(100vh-4rem)] grid place-items-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="flex justify-center -mb-6 relative z-10">
          <Companion
            id={mode === "signup" ? "chispa" : "igno"}
            size={140}
            state={busy ? "thinking" : email && !password ? "listening" : mood}
          />
        </div>
        <div className="rounded-3xl bg-card border border-border p-6 pt-10 shadow-soft animate-pop-in">
          <div className="grid grid-cols-2 gap-1 rounded-full bg-muted p-1 mb-5" role="tablist">
            {(["login", "signup"] as const).map((m) => (
              <button
                key={m}
                role="tab"
                aria-selected={mode === m}
                onClick={() => {
                  setMode(m);
                  setError(null);
                  setNotice(null);
                  setMood("happy");
                }}
                className={`rounded-full py-2 text-sm font-bold transition-colors ${mode === m ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
              >
                {m === "login" ? t.login : t.signup}
              </button>
            ))}
          </div>
          <h1 className="font-display text-2xl font-bold">
            {mode === "login" ? t.welcome : t.create}
          </h1>
          <p className="text-sm text-muted-foreground mt-1 mb-5">
            {mode === "login" ? t.welcomeSub : t.createSub}
          </p>

          <form onSubmit={submit} className="space-y-3">
            {mode === "signup" && (
              <label className="block">
                <span className="text-sm font-bold">{t.name}</span>
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                  className="mt-1 w-full rounded-2xl bg-muted px-4 py-3 outline-none focus:ring-2 ring-primary"
                />
              </label>
            )}
            <label className="block">
              <span className="text-sm font-bold">{t.email}</span>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                className="mt-1 w-full rounded-2xl bg-muted px-4 py-3 outline-none focus:ring-2 ring-primary"
              />
            </label>
            <label className="block">
              <span className="text-sm font-bold">{t.password}</span>
              <input
                required
                type="password"
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                className="mt-1 w-full rounded-2xl bg-muted px-4 py-3 outline-none focus:ring-2 ring-primary"
              />
              {mode === "signup" && (
                <span className="text-xs text-muted-foreground">{t.pwHint}</span>
              )}
            </label>
            {error && (
              <p className="rounded-xl bg-destructive/10 text-destructive text-sm px-3 py-2">
                {error}
              </p>
            )}
            {notice && (
              <p className="rounded-xl bg-mint/25 text-mint-foreground text-sm px-3 py-2">
                {notice}
              </p>
            )}
            <button
              disabled={busy}
              className="w-full rounded-full bg-primary text-primary-foreground py-3 font-bold shadow-pop disabled:opacity-60"
            >
              {busy ? t.working : mode === "login" ? t.go : t.goSignup}
            </button>
            {mode === "login" && (
              <button
                type="button"
                onClick={forgot}
                className="w-full text-xs text-muted-foreground hover:underline"
              >
                {t.forgot}
              </button>
            )}
          </form>
        </div>
      </div>
    </main>
  );
}
