import { createFileRoute } from "@tanstack/react-router";
import { useProfile, levelTitle } from "@/lib/profile";

export const Route = createFileRoute("/logros")({
  head: () => ({ meta: [{ title: "Logros — IGNOTO" }] }),
  component: Logros,
});

const ALL_BADGES = [
  { id: "primer-paso", emoji: "🌱", name: "Primer paso", desc: "Creaste tu perfil" },
  { id: "racha-3", emoji: "🔥", name: "Racha de 3", desc: "3 días seguidos" },
  { id: "sabelotodo", emoji: "🧠", name: "Sabelotodo", desc: "5 lecciones completas" },
  { id: "explorador", emoji: "🧭", name: "Explorador", desc: "Probaste 3 materias" },
  { id: "matematico", emoji: "🔢", name: "Matemático", desc: "5 quizzes de mate" },
  { id: "lector", emoji: "📚", name: "Devorador de libros", desc: "5 lecciones de lectura" },
  { id: "cientifico", emoji: "🔬", name: "Pequeño científico", desc: "5 lecciones de ciencias" },
  { id: "leyenda", emoji: "🏆", name: "Leyenda", desc: "Llega a nivel Leyenda" },
];

function Logros() {
  const profile = useProfile();
  if (!profile) return <div className="min-h-[60vh] grid place-items-center text-muted-foreground">Cargando…</div>;
  const earned = new Set(profile.badges);
  if (profile.completedLessons.length >= 5) earned.add("sabelotodo");
  if (profile.streak >= 3) earned.add("racha-3");
  const lvl = levelTitle(profile.xp);

  return (
    <main className="max-w-4xl mx-auto px-4 py-6 pb-24">
      <h1 className="font-display text-3xl font-bold mb-1">🏆 Logros</h1>
      <p className="text-muted-foreground mb-5">Nivel actual: <strong className="text-primary">{lvl.name}</strong></p>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {ALL_BADGES.map((b) => {
          const got = earned.has(b.id);
          return (
            <div key={b.id} className={`rounded-3xl p-4 text-center border-2 transition-all ${got ? "bg-card border-accent shadow-soft" : "bg-muted/50 border-border opacity-60"}`}>
              <div className={`text-5xl ${got ? "animate-bounce-slow" : "grayscale"}`}>{b.emoji}</div>
              <div className="font-display font-bold mt-2">{b.name}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{b.desc}</div>
              {got && <div className="mt-2 text-[10px] uppercase font-bold text-mint">Desbloqueado</div>}
            </div>
          );
        })}
      </div>
    </main>
  );
}
