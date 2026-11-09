import { createFileRoute } from "@tanstack/react-router";
import { SubjectIcon } from "@/components/SubjectIcon";
import { stripEmoji } from "@/lib/text";
import { useRequireLearner } from "@/lib/use-guard";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { parentReport } from "@/lib/ai.functions";
import { useProfile } from "@/lib/profile";
import { SUBJECTS } from "@/lib/profile";
import { buildCurriculum } from "@/lib/curriculum";
import { useT } from "@/lib/i18n";

const T = {
  es: {
    loading: "Cargando…",
    h1: "Reporte de progreso",
    follow: (n: string) => `Sigue el progreso de ${n}.`,
    lessons: "Lecciones",
    xp: "XP total",
    streak: "Racha",
    bySubject: "Progreso por materia",
    difficulty: "dificultad",
    weekly: "Resumen semanal con IA",
    generate: "Generar con IA",
    generating: "Generando…",
    placeholder: "IGNO escribirá un resumen personalizado del progreso.",
  },
  en: {
    loading: "Loading…",
    h1: "Progress report",
    follow: (n: string) => `Follow ${n}'s progress.`,
    lessons: "Lessons",
    xp: "Total XP",
    streak: "Streak",
    bySubject: "Progress by subject",
    difficulty: "difficulty",
    weekly: "AI weekly summary",
    generate: "Generate with AI",
    generating: "Generating…",
    placeholder: "IGNO will write a personalized summary of progress.",
  },
} as const;

export const Route = createFileRoute("/padres")({
  head: () => ({ meta: [{ title: "Reporte de progreso · IGNOTO" }] }),
  component: Padres,
});

function Padres() {
  const profile = useRequireLearner();
  const t = useT(T);
  const ask = useServerFn(parentReport);
  const [report, setReport] = useState<string>("");
  const [loading, setLoading] = useState(false);

  if (!profile) return <div className="min-h-[60vh] grid place-items-center text-muted-foreground">{t.loading}</div>;

  const all = buildCurriculum(profile);
  const bySubject = profile.subjects.map((s) => {
    const total = all.filter((l) => l.subject === s.id).length;
    const done = all.filter((l) => l.subject === s.id && profile.completedLessons.includes(l.id)).length;
    const meta = SUBJECTS.find((x) => x.id === s.id)!;
    return { ...meta, total, done, pct: total ? Math.round((done / total) * 100) : 0, difficulty: s.difficulty };
  });

  async function generate() {
    if (!profile) return;
    const p = profile;
    setLoading(true); setReport("");
    try {
      const r = await ask({ data: {
        childName: p.childName, xp: p.xp, streak: p.streak,
        completedCount: p.completedLessons.length,
        subjects: p.subjects.map((s) => ({ name: SUBJECTS.find(x => x.id === s.id)!.label, difficulty: s.difficulty })),
        language: p.language,
      }});
      setReport(r.report);
    } catch (e) { setReport(e instanceof Error ? e.message : "Error"); }
    finally { setLoading(false); }
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-6 pb-24 space-y-6">
      <header>
        <h1 className="font-display text-3xl">{t.h1}</h1>
        <p className="text-muted-foreground mt-1">{t.follow(profile.childName)}</p>
      </header>

      <section className="grid grid-cols-3 gap-3">
        <Stat label={t.lessons} value={profile.completedLessons.length} accent="primary" />
        <Stat label={t.xp} value={profile.xp} accent="accent" />
        <Stat label={t.streak} value={profile.streak} accent="coral" />
      </section>

      <section className="rounded-3xl bg-card sticker p-5">
        <h2 className="font-display text-xl mb-3">{t.bySubject}</h2>
        <div className="space-y-3">
          {bySubject.map((s) => (
            <div key={s.id}>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="flex items-center gap-2 font-semibold"><SubjectIcon id={s.id} size={28} /> {s.label}</span>
                <span className="text-muted-foreground tabular-nums">{s.done}/{s.total} · {t.difficulty} {s.difficulty}/4</span>
              </div>
              <div className="h-3 rounded-full border-2 border-ink bg-background overflow-hidden"><div className="h-full bg-primary" style={{ width: `${s.pct}%` }} /></div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-3xl bg-card sticker p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display text-xl">{t.weekly}</h2>
          <button onClick={generate} disabled={loading} className="btn-sticker bg-primary text-primary-foreground px-4 py-2 text-sm">
            {loading ? t.generating : t.generate}
          </button>
        </div>
        {report ? (
          <div className="paper-lines rounded-2xl border-2 border-ink p-4 pl-14 whitespace-pre-wrap text-sm leading-[1.85rem]">{stripEmoji(report)}</div>
        ) : (
          <p className="text-sm text-muted-foreground">{t.placeholder}</p>
        )}
      </section>
    </main>
  );
}

function Stat({ label, value, accent }: { label: string; value: string | number; accent: "primary" | "accent" | "coral" }) {
  const cls = accent === "primary" ? "bg-pink" : accent === "accent" ? "bg-lime" : "bg-sky";
  return (
    <div className={`rounded-2xl p-4 text-center sticker-sm ${cls}`}>
      <div className="font-display text-3xl tabular-nums">{value}</div>
      <div className="text-xs opacity-90">{label}</div>
    </div>
  );
}
