import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useProfile } from "@/lib/profile";
import { dailyMission, weeklyPlan } from "@/lib/curriculum";
import { LevelBadge } from "@/components/AppHeader";
import { GenThemeBanner } from "@/components/gen-ui/primitives";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Inicio — IGNOTO" }] }),
  component: Dashboard,
});

function Dashboard() {
  const profile = useProfile();
  const nav = useNavigate();
  useEffect(() => { if (typeof window !== "undefined" && profile === null) {
    const t = setTimeout(() => { if (!localStorage.getItem("ignoto.profile.v1")) nav({ to: "/registro" }); }, 250);
    return () => clearTimeout(t);
  }}, [profile, nav]);
  if (!profile) return <div className="min-h-[60vh] grid place-items-center text-muted-foreground">Cargando…</div>;

  const mission = dailyMission(profile);
  const plan = weeklyPlan(profile);

  return (
    <main className="max-w-6xl mx-auto px-4 py-6 pb-24 space-y-6">
      <GenThemeBanner />
      <section className="rounded-3xl bg-gradient-hero p-6 text-primary-foreground shadow-soft relative overflow-hidden">
        <div className="absolute -top-4 -right-4 text-8xl opacity-25">{profile.avatar}</div>
        <p className="text-sm opacity-90">¡Hola de nuevo,</p>
        <h1 className="font-display text-3xl md:text-4xl font-bold">{profile.childName}! 👋</h1>
        <p className="mt-2 opacity-90 text-sm">Llevas {profile.streak} día{profile.streak !== 1 && "s"} de racha. ¡No la pierdas hoy!</p>
      </section>

      <LevelBadge />

      {mission && (
        <section>
          <h2 className="font-display text-xl font-bold mb-3">🎯 Misión del día</h2>
          <Link to="/leccion/$id" params={{ id: mission.id }} className="block rounded-3xl bg-card border-2 border-primary p-5 shadow-soft hover:scale-[1.01] transition-transform animate-pop-in">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-sun flex items-center justify-center text-3xl shrink-0 shadow-pop">{mission.emoji}</div>
              <div className="flex-1">
                <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{mission.subjectLabel}</div>
                <div className="font-display text-xl font-bold">{mission.title}</div>
                <div className="text-sm text-muted-foreground mt-1">⏱ {mission.estMin} min · ⭐ +30 XP</div>
              </div>
              <div className="self-center text-2xl text-primary">→</div>
            </div>
          </Link>
        </section>
      )}

      <section>
        <h2 className="font-display text-xl font-bold mb-3">🗓 Plan semanal</h2>
        <div className="grid grid-cols-7 gap-1.5">
          {plan.map((d, i) => (
            <div key={i} className="rounded-2xl bg-card border border-border p-2 text-center min-h-[110px] flex flex-col">
              <div className="text-[10px] font-bold text-muted-foreground">{d.day}</div>
              <div className="flex flex-col gap-1 mt-1.5 flex-1">
                {d.lessons.map((l) => (
                  <Link key={l.id} to="/leccion/$id" params={{ id: l.id }} className="text-2xl rounded-lg bg-muted hover:bg-accent transition-colors py-1" title={l.title}>{l.emoji}</Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="font-display text-xl font-bold mb-3">🗺 Mapa de aprendizaje</h2>
        <Link to="/mapa" className="block rounded-3xl bg-gradient-mint p-5 text-mint-foreground shadow-soft hover:scale-[1.01] transition-transform">
          <div className="flex items-center gap-4">
            <div className="text-5xl animate-bounce-slow">🗺️</div>
            <div className="flex-1">
              <div className="font-display text-xl font-bold">Tu aventura</div>
              <div className="text-sm opacity-90">Desbloquea lecciones en el mapa</div>
            </div>
            <div className="text-2xl">→</div>
          </div>
        </Link>
      </section>
    </main>
  );
}
