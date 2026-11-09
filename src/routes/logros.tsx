import { createFileRoute } from "@tanstack/react-router";
import { BadgeIcon } from "@/components/SubjectIcon";
import { useRequireLearner } from "@/lib/use-guard";
import { useProfile, levelTitle } from "@/lib/profile";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/logros")({
  head: () => ({ meta: [{ title: "Logros · IGNOTO" }] }),
  component: Logros,
});

const T = {
  es: {
    loading: "Cargando…",
    h1: "Logros",
    levelLabel: "Nivel actual:",
    unlocked: "Desbloqueado",
    badges: [
      { id: "primer-paso", name: "Primer paso", desc: "Creaste tu perfil" },
      { id: "racha-3", name: "Racha de 3", desc: "3 días seguidos" },
      { id: "sabelotodo", name: "Sabelotodo", desc: "5 lecciones completas" },
      { id: "explorador", name: "Explorador", desc: "Probaste 3 materias" },
      { id: "matematico", name: "Matemático", desc: "5 quizzes de mate" },
      { id: "lector", name: "Devorador de libros", desc: "5 lecciones de lectura" },
      { id: "cientifico", name: "Pequeño científico", desc: "5 lecciones de ciencias" },
      { id: "leyenda", name: "Leyenda", desc: "Llega a nivel Leyenda" },
    ],
  },
  en: {
    loading: "Loading…",
    h1: "Achievements",
    levelLabel: "Current level:",
    unlocked: "Unlocked",
    badges: [
      { id: "primer-paso", name: "First step", desc: "You created your profile" },
      { id: "racha-3", name: "3-day streak", desc: "3 days in a row" },
      { id: "sabelotodo", name: "Know-it-all", desc: "5 lessons completed" },
      { id: "explorador", name: "Explorer", desc: "Tried 3 subjects" },
      { id: "matematico", name: "Mathematician", desc: "5 math quizzes" },
      { id: "lector", name: "Bookworm", desc: "5 reading lessons" },
      { id: "cientifico", name: "Little scientist", desc: "5 science lessons" },
      { id: "leyenda", name: "Legend", desc: "Reach Legend level" },
    ],
  },
} as const;

function Logros() {
  const profile = useRequireLearner();
  const t = useT(T);
  if (!profile) return <div className="min-h-[60vh] grid place-items-center text-muted-foreground">{t.loading}</div>;
  const earned = new Set(profile.badges);
  if (profile.completedLessons.length >= 5) earned.add("sabelotodo");
  if (profile.streak >= 3) earned.add("racha-3");
  const lvl = levelTitle(profile.xp);

  return (
    <main className="max-w-4xl mx-auto px-4 py-6 pb-24">
      <h1 className="font-display text-3xl mb-1">{t.h1}</h1>
      <p className="text-muted-foreground mb-5">{t.levelLabel} <strong className="text-primary">{lvl.name}</strong></p>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {t.badges.map((b) => {
          const got = earned.has(b.id);
          return (
            <div key={b.id} className={`rounded-3xl p-4 text-center ${got ? "bg-card sticker" : "border-2 border-dashed border-ink/40 opacity-70"}`}>
              <BadgeIcon id={b.id} earned={got} />
              <div className="font-display text-lg mt-2">{b.name}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{b.desc}</div>
              {got && <div className="mt-2 inline-block rounded-full border-2 border-ink bg-mint px-2 text-[11px] font-bold">{t.unlocked}</div>}
            </div>
          );
        })}
      </div>
    </main>
  );
}
