import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useProfile } from "@/lib/profile";
import { buildCurriculum } from "@/lib/curriculum";

export const Route = createFileRoute("/mapa")({
  head: () => ({ meta: [{ title: "Mapa — IGNOTO" }] }),
  component: Mapa,
});

function Mapa() {
  const profile = useProfile();
  const nav = useNavigate();
  useEffect(() => { if (profile === null && typeof window !== "undefined") {
    const t = setTimeout(() => { if (!localStorage.getItem("ignoto.profile.v1")) nav({ to: "/registro" }); }, 250);
    return () => clearTimeout(t);
  }}, [profile, nav]);
  if (!profile) return <div className="min-h-[60vh] grid place-items-center text-muted-foreground">Cargando…</div>;

  const lessons = buildCurriculum(profile);
  const done = new Set(profile.completedLessons);

  return (
    <main className="max-w-3xl mx-auto px-4 py-6 pb-24">
      <h1 className="font-display text-3xl font-bold mb-6">🗺 Mapa de aprendizaje</h1>
      <div className="relative">
        <svg className="absolute inset-0 w-full h-full -z-0" preserveAspectRatio="none" />
        <div className="space-y-2">
          {lessons.map((l, i) => {
            const isDone = done.has(l.id);
            const isLocked = i > 0 && !done.has(lessons[i - 1].id) && !isDone;
            const align = i % 2 === 0 ? "justify-start" : "justify-end";
            return (
              <div key={l.id} className={`flex ${align}`}>
                <Link
                  to="/leccion/$id" params={{ id: l.id }}
                  onClick={(e) => { if (isLocked) e.preventDefault(); }}
                  className={`relative max-w-[80%] rounded-3xl p-4 flex items-center gap-3 transition-all shadow-soft ${
                    isDone ? "bg-mint text-mint-foreground" :
                    isLocked ? "bg-muted text-muted-foreground opacity-60 cursor-not-allowed" :
                    "bg-card border-2 border-primary hover:scale-105"
                  }`}
                >
                  <div className="w-12 h-12 rounded-2xl bg-background/40 flex items-center justify-center text-2xl">
                    {isLocked ? "🔒" : isDone ? "✓" : l.emoji}
                  </div>
                  <div>
                    <div className="text-xs font-bold uppercase opacity-75">{l.subjectLabel}</div>
                    <div className="font-display font-bold">{l.title}</div>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
