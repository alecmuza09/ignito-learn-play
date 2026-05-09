import { Link, useLocation } from "@tanstack/react-router";
import { useProfile, levelTitle } from "@/lib/profile";
import { KawaiiBlob } from "./KawaiiBlob";

export function AppHeader() {
  const profile = useProfile();
  const loc = useLocation();
  const onAuthFlow = loc.pathname === "/" || loc.pathname.startsWith("/registro");

  return (
    <header className="sticky top-0 z-40 bg-background/85 backdrop-blur-md border-b border-border">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
        <Link to="/" className="flex items-center gap-2 font-display text-2xl font-bold tracking-tight">
          <KawaiiBlob shape="blob" color="var(--primary)" size={36} mood="happy" />
          <span className="text-foreground">IGNOTO</span>
        </Link>
        <nav className="ml-auto hidden md:flex items-center gap-1 text-sm font-semibold">
          {profile ? (
            <>
              <Link to="/dashboard" className="px-3 py-2 rounded-full hover:bg-muted" activeProps={{ className: "px-3 py-2 rounded-full bg-primary text-primary-foreground" }}>Inicio</Link>
              <Link to="/mapa" className="px-3 py-2 rounded-full hover:bg-muted" activeProps={{ className: "px-3 py-2 rounded-full bg-primary text-primary-foreground" }}>Mapa</Link>
              <Link to="/logros" className="px-3 py-2 rounded-full hover:bg-muted" activeProps={{ className: "px-3 py-2 rounded-full bg-primary text-primary-foreground" }}>Logros</Link>
              <Link to="/padres" className="px-3 py-2 rounded-full hover:bg-muted" activeProps={{ className: "px-3 py-2 rounded-full bg-primary text-primary-foreground" }}>Padres</Link>
              <Link to="/perfil" className="px-3 py-2 rounded-full hover:bg-muted" activeProps={{ className: "px-3 py-2 rounded-full bg-primary text-primary-foreground" }}>Perfil</Link>
            </>
          ) : !onAuthFlow ? (
            <Link to="/registro" className="px-4 py-2 rounded-full bg-primary text-primary-foreground">Empezar</Link>
          ) : null}
        </nav>
        {profile && (
          <div className="ml-auto md:ml-0 flex items-center gap-2 text-xs">
            <span className="rounded-full bg-accent text-accent-foreground px-2.5 py-1 font-bold flex items-center gap-1">⭐ {profile.xp}</span>
            <span className="rounded-full bg-coral text-coral-foreground px-2.5 py-1 font-bold flex items-center gap-1">🪙 {profile.coins}</span>
            <span className="rounded-full bg-mint text-mint-foreground px-2.5 py-1 font-bold flex items-center gap-1">🔥 {profile.streak}</span>
          </div>
        )}
      </div>
      {profile && (
        <div className="md:hidden border-t border-border bg-card/60 overflow-x-auto">
          <div className="flex gap-1 px-3 py-2 text-xs font-semibold whitespace-nowrap">
            <Link to="/dashboard" className="px-3 py-1.5 rounded-full bg-muted" activeProps={{ className: "px-3 py-1.5 rounded-full bg-primary text-primary-foreground" }}>Inicio</Link>
            <Link to="/mapa" className="px-3 py-1.5 rounded-full bg-muted" activeProps={{ className: "px-3 py-1.5 rounded-full bg-primary text-primary-foreground" }}>Mapa</Link>
            <Link to="/logros" className="px-3 py-1.5 rounded-full bg-muted" activeProps={{ className: "px-3 py-1.5 rounded-full bg-primary text-primary-foreground" }}>Logros</Link>
            <Link to="/padres" className="px-3 py-1.5 rounded-full bg-muted" activeProps={{ className: "px-3 py-1.5 rounded-full bg-primary text-primary-foreground" }}>Padres</Link>
            <Link to="/perfil" className="px-3 py-1.5 rounded-full bg-muted" activeProps={{ className: "px-3 py-1.5 rounded-full bg-primary text-primary-foreground" }}>Perfil</Link>
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
        <div className="h-full bg-primary transition-all duration-500" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
