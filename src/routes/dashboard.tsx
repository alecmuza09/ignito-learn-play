import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useProfile } from "@/lib/profile";
import { dailyMission, weeklyPlan } from "@/lib/curriculum";
import { LevelBadge } from "@/components/AppHeader";
import { GenThemeBanner } from "@/components/gen-ui/primitives";
import { KawaiiBlob, KawaiiBlobCluster } from "@/components/gen-ui/KawaiiBlob";
import { useT } from "@/lib/i18n";

const T = {
  es: {
    title: "Inicio — IGNOTO",
    loading: "Cargando…",
    hello: "¡Hola de nuevo,",
    streakA: "Llevas",
    streakB: (n: number) => `día${n !== 1 ? "s" : ""}`,
    streakC: "de racha. No la pierdas hoy.",
    mission: "Misión del día",
    min: "min",
    weekly: "Plan semanal",
    map: "Mapa de aprendizaje",
    adventure: "Tu aventura",
    unlock: "Desbloquea lecciones en el mapa",
  },
  en: {
    title: "Home — IGNOTO",
    loading: "Loading…",
    hello: "Welcome back,",
    streakA: "You're on a",
    streakB: (n: number) => `day${n !== 1 ? "s" : ""}`,
    streakC: "streak. Don't lose it today.",
    mission: "Today's mission",
    min: "min",
    weekly: "Weekly plan",
    map: "Learning map",
    adventure: "Your adventure",
    unlock: "Unlock lessons on the map",
  },
} as const;

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Inicio — IGNOTO" }] }),
  component: Dashboard,
});

function Dashboard() {
  const profile = useProfile();
  const nav = useNavigate();
  const t = useT(T);
  useEffect(() => { if (typeof window !== "undefined" && profile === null) {
    const t = setTimeout(() => { if (!localStorage.getItem("ignoto.profile.v1")) nav({ to: "/registro" }); }, 250);
    return () => clearTimeout(t);
  }}, [profile, nav]);
  if (!profile) return <div className="min-h-[60vh] grid place-items-center text-muted-foreground">{t.loading}</div>;

  const mission = dailyMission(profile);
  const plan = weeklyPlan(profile);

  return (
    <main className="max-w-6xl mx-auto px-4 py-6 pb-24 space-y-6">
      <GenThemeBanner />
      <section className="rounded-3xl bg-card border border-border p-6 md:p-8 shadow-soft relative overflow-hidden">
        <div className="flex items-center gap-6">
          <div className="flex-1 min-w-0">
            <p className="text-sm text-muted-foreground font-semibold">{t.hello}</p>
            <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight leading-[1.05]">
              {profile.childName}!
            </h1>
            <p className="mt-3 text-muted-foreground">{t.streakA} <span className="font-bold text-foreground">{profile.streak} {t.streakB(profile.streak)}</span> {t.streakC}</p>
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
          <h2 className="font-display text-2xl font-bold mb-3 tracking-tight">{t.mission}</h2>
          <Link to="/leccion/$id" params={{ id: mission.id }} className="block rounded-3xl bg-card border border-border p-5 shadow-soft hover:-translate-y-0.5 transition-transform animate-pop-in">
            <div className="flex items-center gap-4">
              <KawaiiBlob size={72} tone="coral" mood="happy" />
              <div className="flex-1">
                <div className="text-xs font-bold text-muted-foreground uppercase tracking-[0.15em]">{mission.subjectLabel}</div>
                <div className="font-display text-xl font-bold leading-tight">{mission.title}</div>
                <div className="text-sm text-muted-foreground mt-1">{mission.estMin} {t.min} · +30 XP</div>
              </div>
              <div className="self-center text-2xl text-primary">→</div>
            </div>
          </Link>
        </section>
      )}

      <section>
        <h2 className="font-display text-2xl font-bold mb-3 tracking-tight">{t.weekly}</h2>
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
        <h2 className="font-display text-2xl font-bold mb-3 tracking-tight">{t.map}</h2>
        <Link to="/mapa" className="block rounded-3xl bg-card border border-border p-5 shadow-soft hover:-translate-y-0.5 transition-transform">
          <div className="flex items-center gap-4">
            <KawaiiBlob size={72} tone="mint" mood="calm" />
            <div className="flex-1">
              <div className="font-display text-xl font-bold">{t.adventure}</div>
              <div className="text-sm text-muted-foreground">{t.unlock}</div>
            </div>
            <div className="text-2xl text-primary">→</div>
          </div>
        </Link>
      </section>
    </main>
  );
}
