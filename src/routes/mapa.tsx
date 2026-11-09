import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useRequireLearner } from "@/lib/use-guard";
import { buildCurriculum } from "@/lib/curriculum";
import { SUBJECTS } from "@/lib/profile";
import { Check, Lock } from "lucide-react";
import { SubjectIcon } from "@/components/SubjectIcon";
import { useT } from "@/lib/i18n";

const T = {
  es: {
    loading: "Cargando…",
    h1: "Mapa de aprendizaje",
    sub: "Cada materia tiene su propio camino. Elige por dónde aventurarte.",
    all: "Todas",
    completed: "completadas",
  },
  en: {
    loading: "Loading…",
    h1: "Learning map",
    sub: "Each subject has its own path. Pick where to adventure.",
    all: "All",
    completed: "completed",
  },
} as const;

export const Route = createFileRoute("/mapa")({
  head: () => ({ meta: [{ title: "Mapa · IGNOTO" }] }),
  component: Mapa,
});

function Mapa() {
  const profile = useRequireLearner();
  const t = useT(T);
  const [active, setActive] = useState<string | "todas">("todas");
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
      <h1 className="font-display text-3xl mb-2">{t.h1}</h1>
      <p className="text-muted-foreground mb-5">{t.sub}</p>

      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 -mx-4 px-4">
        <button onClick={() => setActive("todas")}
          aria-pressed={active === "todas"} className="chip shrink-0">
          {t.all}
        </button>
        {groups.map((g) => (
          <button key={g.meta.id} onClick={() => setActive(g.meta.id)}
            aria-pressed={active === g.meta.id} className="chip shrink-0">
            {g.meta.label}
          </button>
        ))}
      </div>

      <div className="space-y-8">
        {visible.map((g) => (
          <section key={g.meta.id} className="rounded-3xl bg-card sticker p-5">
            <header className="flex items-center gap-3 mb-4">
              <SubjectIcon id={g.meta.id} size={48} />
              <div className="flex-1">
                <h2 className="font-display text-2xl">{g.meta.label}</h2>
                <div className="text-xs text-muted-foreground font-bold">{g.completed}/{g.list.length} {t.completed}</div>
                <div className="h-2.5 mt-1.5 rounded-full border-2 border-ink bg-background overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: `${g.list.length ? (g.completed / g.list.length) * 100 : 0}%` }} />
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
                        isDone ? "bg-mint border-2 border-ink" :
                        isLocked ? "border-2 border-dashed border-ink/40 text-muted-foreground cursor-not-allowed" :
                        "bg-lime border-2 border-ink shadow-[3px_3px_0_var(--ink)] hover:-translate-y-0.5"
                      }`}
                    >
                      <div className="w-10 h-10 rounded-xl border-2 border-ink bg-card flex items-center justify-center font-display text-lg shrink-0">
                        {isLocked ? <Lock className="h-4 w-4" /> : isDone ? <Check className="h-5 w-5" strokeWidth={3} /> : i + 1}
                      </div>
                      <div className="font-semibold text-sm">{l.title}</div>
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
