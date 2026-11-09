import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useT } from "@/lib/i18n";
import { Companion } from "@/components/companion/Companion";
import type { CompanionState } from "@/components/companion/Companion";
import { Eye, EyeOff } from "lucide-react";

const T = {
  es: {
    login: "Entrar",
    signup: "Crear cuenta",
    welcome: "¡Qué bueno verte!",
    welcomeSub: "Entra para seguir aprendiendo en familia.",
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
    needEmail: "Escribe tu correo arriba y vuelve a tocar aquí.",
    show: "Mostrar contraseña",
    hide: "Ocultar contraseña",
    errors: {
      invalid: "Correo o contraseña incorrectos.",
      unconfirmed: "Confirma tu correo antes de entrar. Revisa tu bandeja (y spam).",
      exists: "Ya hay una cuenta con ese correo. Entra con tu contraseña.",
      weak: "La contraseña debe tener al menos 8 caracteres.",
      rate: "Demasiados intentos. Espera un minuto e inténtalo de nuevo.",
      network: "No hay conexión. Revisa tu internet.",
    },
  },
  en: {
    login: "Sign in",
    signup: "Create account",
    welcome: "Great to see you!",
    welcomeSub: "Sign in to keep learning as a family.",
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
    needEmail: "Type your email above and tap here again.",
    show: "Show password",
    hide: "Hide password",
    errors: {
      invalid: "Wrong email or password.",
      unconfirmed: "Confirm your email before signing in. Check your inbox (and spam).",
      exists: "There's already an account with that email. Sign in instead.",
      weak: "Password must be at least 8 characters.",
      rate: "Too many attempts. Wait a minute and try again.",
      network: "You're offline. Check your connection.",
    },
  },
} as const;

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Entrar · IGNOTO" }] }),
  validateSearch: (s: Record<string, unknown>): { suspendida?: number } =>
    s.suspendida ? { suspendida: 1 } : {},
  component: AuthPage,
});

/** Turns Supabase auth errors into a short sentence a parent understands. */
function friendlyError(err: unknown, e: { invalid: string; unconfirmed: string; exists: string; weak: string; rate: string; network: string }) {
  const msg = err instanceof Error ? err.message : String(err);
  const m = msg.toLowerCase();
  if (m.includes("invalid login") || m.includes("invalid credentials")) return e.invalid;
  if (m.includes("not confirmed")) return e.unconfirmed;
  if (m.includes("already registered") || m.includes("already exists")) return e.exists;
  if (m.includes("password") && (m.includes("least") || m.includes("short") || m.includes("weak"))) return e.weak;
  if (m.includes("rate limit") || m.includes("too many")) return e.rate;
  if (m.includes("failed to fetch") || m.includes("network")) return e.network;
  return msg;
}

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
  const [showPw, setShowPw] = useState(false);

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
          email: email.trim(),
          password,
          options: {
            data: { display_name: name.trim() },
            emailRedirectTo: `${window.location.origin}/familia`,
          },
        });
        if (error) throw error;
        if (!data.session) setNotice(t.checkEmail);
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (error) throw error;
      }
      setMood("celebrate");
    } catch (err) {
      setMood("sad");
      setError(friendlyError(err, t.errors));
    } finally {
      setBusy(false);
    }
  }

  async function forgot() {
    if (!email.trim()) {
      setError(t.needEmail);
      return;
    }
    setError(null);
    await supabase.auth.resetPasswordForEmail(email.trim(), {
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
            size={112}
            state={busy ? "thinking" : email && !password ? "listening" : mood}
          />
        </div>
        <div className="rounded-3xl bg-card sticker p-6 pt-10 animate-pop-in">
          <div className="grid grid-cols-2 gap-1 rounded-full border-2 border-ink bg-background p-1 mb-5" role="tablist">
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
                className={`rounded-full py-2 text-sm font-bold transition-colors ${mode === m ? "bg-lime border-2 border-ink" : "border-2 border-transparent text-muted-foreground"}`}
              >
                {m === "login" ? t.login : t.signup}
              </button>
            ))}
          </div>
          <h1 className="font-display text-3xl">
            {mode === "login" ? t.welcome : t.create}
          </h1>
          <p className="text-sm text-muted-foreground mt-1 mb-5">
            {mode === "login" ? t.welcomeSub : t.createSub}
          </p>

          <form onSubmit={submit} className="space-y-4">
            {mode === "signup" && (
              <label className="block">
                <span className="label">{t.name}</span>
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                  className="field"
                />
              </label>
            )}
            <label className="block">
              <span className="label">{t.email}</span>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                className="field"
              />
            </label>
            <label className="block">
              <span className="label">{t.password}</span>
              <span className="relative block">
                <input
                  required
                  type={showPw ? "text" : "password"}
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                  className="field pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 grid h-9 w-9 place-items-center rounded-lg hover:bg-secondary"
                  aria-label={showPw ? t.hide : t.show}
                >
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </span>
              {mode === "signup" && (
                <span className="hint mt-1 block">{t.pwHint}</span>
              )}
            </label>
            {error && (
              <p role="alert" className="rounded-xl border-2 border-destructive bg-destructive/5 text-destructive text-sm font-semibold px-3 py-2">
                {error}
              </p>
            )}
            {notice && (
              <p role="status" className="rounded-xl border-2 border-ink bg-mint text-sm font-semibold px-3 py-2">
                {notice}
              </p>
            )}
            <button
              disabled={busy}
              className="btn-sticker w-full bg-primary text-primary-foreground h-12"
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
