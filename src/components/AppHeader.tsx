import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { LogOut, ShieldCheck, Users } from "lucide-react";
import { clearActiveLearner, useProfile, levelTitle } from "@/lib/profile";
import { useAuth } from "@/lib/auth";
import { Companion } from "./companion/Companion";
import { LanguageToggle, useT } from "@/lib/i18n";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const NAV = {
  es: { inicio: "Inicio", mapa: "Mapa", logros: "Logros", padres: "Reporte", perfil: "Perfil", start: "Empezar", login: "Entrar", switch: "Cambiar de perfil", family: "Mi familia", admin: "Administración", logout: "Cerrar sesión" },
  en: { inicio: "Home", mapa: "Map", logros: "Achievements", padres: "Report", perfil: "Profile", start: "Start", login: "Sign in", switch: "Switch profile", family: "My family", admin: "Admin", logout: "Sign out" },
} as const;

const LINK = "px-3 py-2 rounded-full hover:bg-muted transition-colors";
const ACTIVE = { className: "px-3 py-2 rounded-full bg-primary text-primary-foreground" };
const MLINK = "px-3 py-1.5 rounded-full bg-muted";
const MACTIVE = { className: "px-3 py-1.5 rounded-full bg-primary text-primary-foreground" };

export function AppHeader() {
  const profile = useProfile();
  const auth = useAuth();
  const loc = useLocation();
  const nav = useNavigate();
  const onAuthFlow = loc.pathname === "/" || loc.pathname.startsWith("/registro") || loc.pathname.startsWith("/auth");
  const t = useT(NAV);
  const showNav = !!profile && !!auth.session;

  const links = (cls: string, active: { className: string }) => (
    <>
      <Link to="/dashboard" className={cls} activeProps={active}>{t.inicio}</Link>
      <Link to="/mapa" className={cls} activeProps={active}>{t.mapa}</Link>
      <Link to="/logros" className={cls} activeProps={active}>{t.logros}</Link>
      <Link to="/padres" className={cls} activeProps={active}>{t.padres}</Link>
      <Link to="/perfil" className={cls} activeProps={active}>{t.perfil}</Link>
    </>
  );

  return (
    <header className="sticky top-0 z-40 bg-background/85 backdrop-blur-md border-b border-border">
      <div className="max-w-6xl mx-auto px-4 py-2.5 flex items-center gap-3">
        <Link to={auth.session ? "/familia" : "/"} className="flex items-center gap-1.5 font-display text-2xl font-bold tracking-tight">
          <Companion id={profile?.companion ?? "igno"} size={40} interactive={false} />
          <span className="text-foreground">IGNOTO</span>
        </Link>
        <nav className="ml-auto hidden md:flex items-center gap-1 text-sm font-semibold">
          {showNav && links(LINK, ACTIVE)}
          {!auth.session && auth.ready && !onAuthFlow && (
            <Link to="/auth" className="px-4 py-2 rounded-full bg-primary text-primary-foreground">{t.login}</Link>
          )}
          <LanguageToggle className="ml-2" />
        </nav>
        {showNav && (
          <div className="ml-auto md:ml-0 hidden sm:flex items-center gap-2 text-xs">
            <span className="rounded-full bg-accent text-accent-foreground px-2.5 py-1 font-bold">⭐ {profile.xp}</span>
            <span className="rounded-full bg-coral text-coral-foreground px-2.5 py-1 font-bold">🪙 {profile.coins}</span>
            <span className="rounded-full bg-mint text-mint-foreground px-2.5 py-1 font-bold">🔥 {profile.streak}</span>
          </div>
        )}
        {auth.session && (
          <DropdownMenu>
            <DropdownMenuTrigger
              className="ml-auto sm:ml-0 grid h-10 w-10 place-items-center rounded-full bg-muted text-xl hover:ring-2 ring-primary transition"
              aria-label={auth.account?.display_name ?? "Cuenta"}
            >
              {profile?.avatar ?? "👤"}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <div className="font-bold">{profile?.childName ?? auth.account?.display_name}</div>
                <div className="text-xs text-muted-foreground truncate">{auth.user?.email}</div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => { clearActiveLearner(); nav({ to: "/familia" }); }}>
                <Users className="h-4 w-4" /> {profile ? t.switch : t.family}
              </DropdownMenuItem>
              {auth.isAdmin && (
                <DropdownMenuItem onSelect={() => nav({ to: "/admin" })}>
                  <ShieldCheck className="h-4 w-4" /> {t.admin}
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={async () => { await auth.signOut(); nav({ to: "/" }); }}>
                <LogOut className="h-4 w-4" /> {t.logout}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
        {!auth.session && <LanguageToggle className="ml-auto md:hidden" />}
      </div>
      {showNav && (
        <div className="md:hidden border-t border-border bg-card/60 overflow-x-auto">
          <div className="flex gap-1 px-3 py-2 text-xs font-semibold whitespace-nowrap">
            {links(MLINK, MACTIVE)}
            <LanguageToggle className="ml-auto" />
          </div>
        </div>
      )}
    </header>
  );
}

export function LevelBadge() {
  const profile = useProfile();
  if (!profile) return null;
  const lvl = levelTitle(profile.xp);
  const pct = Math.min(100, Math.round((profile.xp / lvl.next) * 100));
  return (
    <div className="rounded-3xl bg-card border border-border p-4 shadow-soft">
      <div className="flex items-center justify-between mb-2">
        <span className="font-display text-lg font-bold">{lvl.name}</span>
        <span className="text-xs text-muted-foreground">{profile.xp}/{lvl.next} XP</span>
      </div>
      <div className="h-3 rounded-full bg-muted overflow-hidden">
        <div className="h-full bg-primary transition-all duration-700 ease-out" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
