import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { parentReport } from "@/lib/ai.functions";
import { useProfile } from "@/lib/profile";
import { SUBJECTS } from "@/lib/profile";
import { buildCurriculum } from "@/lib/curriculum";

export const Route = createFileRoute("/padres")({
  head: () => ({ meta: [{ title: "Padres y tutores — IGNOTO" }] }),
  component: Padres,
});

function Padres() {
  const profile = useProfile();
  const ask = useServerFn(parentReport);
  const [report, setReport] = useState<string>("");
  const [loading, setLoading] = useState(false);

  if (!profile) return <div className="min-h-[60vh] grid place-items-center text-muted-foreground">Cargando…</div>;

  const all = buildCurriculum(profile);
  const bySubject = profile.subjects.map((s) => {
    const total = all.filter((l) => l.subject === s.id).length;
    const done = all.filter((l) => l.subject === s.id && profile.completedLessons.includes(l.id)).length;
    const meta = SUBJECTS.find((x) => x.id === s.id)!;
    return { ...meta, total, done, pct: total ? Math.round((done / total) * 100) : 0, difficulty: s.difficulty };
  });

  async function generate() {
    setLoading(true); setReport("");
    try {
      const r = await ask({ data: {
        childName: profile.childName, xp: profile.xp, streak: profile.streak,
        completedCount: profile.completedLessons.length,
        subjects: profile.subjects.map((s) => ({ name: SUBJECTS.find(x => x.id === s.id)!.label, difficulty: s.difficulty })),
        language: profile.language,
      }});
      setReport(r.report);
    } catch (e) { setReport(e instanceof Error ? e.message : "Error"); }
    finally { setLoading(false); }
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-6 pb-24 space-y-6">
      <header>
        <h1 className="font-display text-3xl font-bold">👨‍👩‍👧 Vista para padres</h1>
        <p className="text-muted-foreground mt-1">Sigue el progreso de {profile.childName}.</p>
      </header>

      <section className="grid grid-cols-3 gap-3">
        <Stat label="Lecciones" value={profile.completedLessons.length} accent="primary" />
        <Stat label="XP total" value={profile.xp} accent="accent" />
        <Stat label="Racha" value={`${profile.streak}🔥`} accent="coral" />
      </section>

      <section className="rounded-3xl bg-card border border-border p-5 shadow-soft">
        <h2 className="font-display text-xl font-bold mb-3">Progreso por materia</h2>
        <div className="space-y-3">
          {bySubject.map((s) => (
            <div key={s.id}>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="font-bold">{s.emoji} {s.label}</span>
                <span className="text-muted-foreground">{s.done}/{s.total} · dificultad {s.difficulty}/4</span>
              </div>
              <div className="h-2.5 rounded-full bg-muted overflow-hidden"><div className="h-full bg-gradient-hero" style={{ width: `${s.pct}%` }} /></div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-3xl bg-card border border-border p-5 shadow-soft">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display text-xl font-bold">📝 Reporte semanal</h2>
          <button onClick={generate} disabled={loading} className="rounded-full bg-primary text-primary-foreground px-4 py-2 text-sm font-bold disabled:opacity-50">
            {loading ? "Generando…" : "Generar con IA"}
          </button>
        </div>
        {report ? (
          <div className="prose prose-sm max-w-none whitespace-pre-wrap text-sm leading-relaxed">{report}</div>
        ) : (
          <p className="text-sm text-muted-foreground">IGNO escribirá un resumen personalizado del progreso.</p>
        )}
      </section>
    </main>
  );
}

function Stat({ label, value, accent }: { label: string; value: string | number; accent: "primary" | "accent" | "coral" }) {
  const cls = accent === "primary" ? "bg-primary text-primary-foreground" : accent === "accent" ? "bg-accent text-accent-foreground" : "bg-coral text-coral-foreground";
  return (
    <div className={`rounded-2xl p-4 text-center shadow-soft ${cls}`}>
      <div className="font-display text-2xl font-bold">{value}</div>
      <div className="text-xs opacity-90">{label}</div>
    </div>
  );
}
