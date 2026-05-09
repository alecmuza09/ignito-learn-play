import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useProfile } from "@/lib/profile";
import { buildCurriculum } from "@/lib/curriculum";
import { SUBJECTS } from "@/lib/profile";
import { useT } from "@/lib/i18n";

const T = {
  es: {
    loading: "Cargando…",
    h1: "🗺 Mapa de aprendizaje",
    sub: "Cada materia tiene su propio camino. Elige por dónde aventurarte.",
    all: "🌈 Todas",
    completed: "completadas",
  },
  en: {
    loading: "Loading…",
    h1: "🗺 Learning map",
    sub: "Each subject has its own path. Pick where to adventure.",
    all: "🌈 All",
    completed: "completed",
  },
} as const;

export const Route = createFileRoute("/mapa")({
  head: () => ({ meta: [{ title: "Mapa — IGNOTO" }] }),
  component: Mapa,
});

function Mapa() {
  const profile = useProfile();
  const nav = useNavigate();
  const t = useT(T);
  const [active, setActive] = useState<string | "todas">("todas");
  useEffect(() => { if (profile === null && typeof window !== "undefined") {
    const t = setTimeout(() => { if (!localStorage.getItem("ignoto.profile.v1")) nav({ to: "/registro" }); }, 250);
    return () => clearTimeout(t);
  }}, [profile, nav]);
  if (!profile) return <div className="min-h-[60vh] grid place-items-center text-muted-foreground">{t.loading}</div>;

  const lessons = buildCurriculum(profile);
  const done = new Set(profile.completedLessons);
  const subjectIds = profile.subjects.map((s) => s.id);
  const groups = subjectIds.map((sid) => {
    const meta = SUBJECTS.find((x) => x.id === sid)!;
    const list = lessons.filter((l) => l.subject === sid);
    const completed = list.filter((l) => done.has(l.id)).length;
    return { meta, list, completed };
  });
  const visible = active === "todas" ? groups : groups.filter((g) => g.meta.id === active);

  return (
    <main className="max-w-3xl mx-auto px-4 py-6 pb-24">
      <h1 className="font-display text-3xl font-bold mb-2">{t.h1}</h1>
      <p className="text-muted-foreground mb-5">{t.sub}</p>

      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 -mx-4 px-4">
        <button onClick={() => setActive("todas")}
          className={`shrink-0 rounded-full px-4 py-2 text-sm font-bold border-2 transition-all ${active === "todas" ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border hover:bg-muted"}`}>
          {t.all}
        </button>
        {groups.map((g) => (
          <button key={g.meta.id} onClick={() => setActive(g.meta.id)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-bold border-2 transition-all ${active === g.meta.id ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border hover:bg-muted"}`}>
            {g.meta.emoji} {g.meta.label}
          </button>
        ))}
      </div>

      <div className="space-y-8">
        {visible.map((g) => (
          <section key={g.meta.id} className="rounded-3xl bg-card border border-border p-5 shadow-soft">
            <header className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-hero text-primary-foreground flex items-center justify-center text-2xl shadow-pop">{g.meta.emoji}</div>
              <div className="flex-1">
                <h2 className="font-display text-xl font-bold">{g.meta.label}</h2>
                <div className="text-xs text-muted-foreground font-bold">{g.completed}/{g.list.length} {t.completed}</div>
                <div className="h-1.5 mt-1 rounded-full bg-muted overflow-hidden">
                  <div className="h-full bg-gradient-hero" style={{ width: `${g.list.length ? (g.completed / g.list.length) * 100 : 0}%` }} />
                </div>
              </div>
            </header>
            <div className="space-y-2">
              {g.list.map((l, i) => {
                const isDone = done.has(l.id);
                const prevDone = i === 0 || done.has(g.list[i - 1].id);
                const isLocked = !prevDone && !isDone;
                const align = i % 2 === 0 ? "justify-start" : "justify-end";
                return (
                  <div key={l.id} className={`flex ${align}`}>
                    <Link
                      to="/leccion/$id" params={{ id: l.id }}
                      onClick={(e) => { if (isLocked) e.preventDefault(); }}
                      className={`max-w-[85%] rounded-2xl p-3 flex items-center gap-3 transition-all ${
                        isDone ? "bg-mint text-mint-foreground shadow-soft" :
                        isLocked ? "bg-muted text-muted-foreground opacity-60 cursor-not-allowed" :
                        "bg-background border-2 border-primary hover:scale-[1.02] shadow-pop"
                      }`}
                    >
                      <div className="w-10 h-10 rounded-xl bg-card/70 flex items-center justify-center text-xl shrink-0">
                        {isLocked ? "🔒" : isDone ? "✓" : i + 1}
                      </div>
                      <div className="font-display font-bold text-sm">{l.title}</div>
                    </Link>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
