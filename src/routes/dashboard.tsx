import { createFileRoute, Link } from "@tanstack/react-router";
import { useRequireLearner } from "@/lib/use-guard";
import { Companion } from "@/components/companion/Companion";
import { ArrowRight } from "lucide-react";
import { SubjectIcon } from "@/components/SubjectIcon";
import { dailyMission, weeklyPlan } from "@/lib/curriculum";
import { LevelBadge } from "@/components/AppHeader";
import { GenThemeBanner } from "@/components/gen-ui/primitives";
import { KawaiiBlob } from "@/components/gen-ui/KawaiiBlob";
import { useT } from "@/lib/i18n";

const T = {
  es: {
    title: "Inicio · IGNOTO",
    loading: "Cargando…",
    hello: "Hola de nuevo,",
    streakA: "Llevas",
    streakB: (n: number) => `día${n !== 1 ? "s" : ""}`,
    streakC: "de racha. No la pierdas hoy.",
    mission: "Misión del día",
    min: "min",
    weekly: "Plan semanal",
    map: "Mapa de aprendizaje",
    adventure: "Tu recorrido",
    unlock: "Todas tus materias y lecciones en un solo lugar",
  },
  en: {
    title: "Home · IGNOTO",
    loading: "Loading…",
    hello: "Welcome back,",
    streakA: "You're on a",
    streakB: (n: number) => `day${n !== 1 ? "s" : ""}`,
    streakC: "streak. Don't lose it today.",
    mission: "Today's mission",
    min: "min",
    weekly: "Weekly plan",
    map: "Learning map",
    adventure: "Your path",
    unlock: "All your subjects and lessons in one place",
  },
} as const;

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Inicio · IGNOTO" }] }),
  component: Dashboard,
});

function Dashboard() {
  const profile = useRequireLearner();
  const t = useT(T);
  if (!profile) return <div className="min-h-[60vh] grid place-items-center text-muted-foreground">{t.loading}</div>;

  const mission = dailyMission(profile);
  const plan = weeklyPlan(profile);

  return (
    <main className="max-w-6xl mx-auto px-4 py-8 pb-28 space-y-8">
      <GenThemeBanner />
      <section className="rounded-3xl bg-card sticker p-6 md:p-8 flex items-center gap-6">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-muted-foreground">{t.hello}</p>
          <h1 className="font-display text-4xl md:text-5xl mt-1 truncate">{profile.childName}</h1>
          <p className="mt-3 text-muted-foreground">
            {t.streakA} <span className="font-semibold text-foreground">{profile.streak} {t.streakB(profile.streak)}</span> {t.streakC}
          </p>
          <div className="mt-5 max-w-md"><LevelBadge /></div>
        </div>
        <Companion id={profile.companion} size={120} state="happy" className="hidden sm:inline-block flex-shrink-0" />
      </section>

      <div className="grid md:grid-cols-2 gap-5">
        {mission && (
          <Link to="/leccion/$id" params={{ id: mission.id }} className="group rounded-3xl bg-card sticker p-6 hover:border-primary/40 transition-colors">
            <p className="text-sm font-semibold text-primary">{t.mission}</p>
            <div className="mt-4 flex items-center gap-4">
              <KawaiiBlob size={56} tone="coral" mood="happy" />
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{mission.subjectLabel}</div>
                <div className="font-display text-xl mt-0.5">{mission.title}</div>
                <div className="text-sm text-muted-foreground mt-1">{mission.estMin} {t.min} · +30 XP</div>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition" />
            </div>
          </Link>
        )}
        <Link to="/mapa" className="group rounded-3xl bg-card sticker p-6 hover:border-primary/40 transition-colors">
          <p className="text-sm font-semibold text-primary">{t.map}</p>
          <div className="mt-4 flex items-center gap-4">
            <KawaiiBlob size={56} tone="mint" mood="calm" />
            <div className="flex-1 min-w-0">
              <div className="font-display text-xl">{t.adventure}</div>
              <div className="text-sm text-muted-foreground mt-1">{t.unlock}</div>
            </div>
            <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition" />
          </div>
        </Link>
      </div>

      <section>
        <h2 className="font-display text-2xl mb-4">{t.weekly}</h2>
        <div className="grid grid-cols-7 gap-2">
          {plan.map((d, i) => (
            <div key={i} className="rounded-2xl bg-card border-2 border-ink p-2 text-center min-h-[112px] flex flex-col">
              <div className="text-[11px] font-semibold text-muted-foreground">{d.day}</div>
              <div className="flex flex-col gap-1 mt-2 flex-1">
                {d.lessons.map((l) => (
                  <Link key={l.id} to="/leccion/$id" params={{ id: l.id }} className="grid place-items-center rounded-lg py-1 hover:-translate-y-0.5 transition-transform" title={l.title} aria-label={l.title}><SubjectIcon id={l.subject} size={32} /></Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
