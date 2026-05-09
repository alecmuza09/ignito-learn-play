import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useProfile } from "@/lib/profile";
import { dailyMission, weeklyPlan } from "@/lib/curriculum";
import { LevelBadge } from "@/components/AppHeader";
import { GenThemeBanner } from "@/components/gen-ui/primitives";
import { KawaiiBlob, KawaiiBlobCluster } from "@/components/gen-ui/KawaiiBlob";

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
      <section className="rounded-3xl bg-card border border-border p-6 md:p-8 shadow-soft relative overflow-hidden">
        <div className="flex items-center gap-6">
          <div className="flex-1 min-w-0">
            <p className="text-sm text-muted-foreground font-semibold">¡Hola de nuevo,</p>
            <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight leading-[1.05]">
              {profile.childName}!
            </h1>
            <p className="mt-3 text-muted-foreground">Llevas <span className="font-bold text-foreground">{profile.streak} día{profile.streak !== 1 && "s"}</span> de racha. No la pierdas hoy.</p>
          </div>
          <div className="hidden sm:block animate-float">
            <KawaiiBlob size={140} mood="wink" />
          </div>
        </div>
        <div className="mt-6 sm:hidden"><KawaiiBlobCluster size={56} /></div>
      </section>

      <LevelBadge />

      {mission && (
        <section>
          <h2 className="font-display text-2xl font-bold mb-3 tracking-tight">Misión del día</h2>
          <Link to="/leccion/$id" params={{ id: mission.id }} className="block rounded-3xl bg-card border border-border p-5 shadow-soft hover:-translate-y-0.5 transition-transform animate-pop-in">
            <div className="flex items-center gap-4">
              <KawaiiBlob size={72} tone="coral" mood="happy" />
              <div className="flex-1">
                <div className="text-xs font-bold text-muted-foreground uppercase tracking-[0.15em]">{mission.subjectLabel}</div>
                <div className="font-display text-xl font-bold leading-tight">{mission.title}</div>
                <div className="text-sm text-muted-foreground mt-1">{mission.estMin} min · +30 XP</div>
              </div>
              <div className="self-center text-2xl text-primary">→</div>
            </div>
          </Link>
        </section>
      )}

      <section>
        <h2 className="font-display text-2xl font-bold mb-3 tracking-tight">Plan semanal</h2>
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
        <h2 className="font-display text-2xl font-bold mb-3 tracking-tight">Mapa de aprendizaje</h2>
        <Link to="/mapa" className="block rounded-3xl bg-card border border-border p-5 shadow-soft hover:-translate-y-0.5 transition-transform">
          <div className="flex items-center gap-4">
            <KawaiiBlob size={72} tone="mint" mood="calm" />
            <div className="flex-1">
              <div className="font-display text-xl font-bold">Tu aventura</div>
              <div className="text-sm text-muted-foreground">Desbloquea lecciones en el mapa</div>
            </div>
            <div className="text-2xl text-primary">→</div>
          </div>
        </Link>
      </section>
    </main>
  );
}
