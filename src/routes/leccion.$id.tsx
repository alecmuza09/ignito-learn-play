import { createFileRoute, Link, useNavigate, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { generateLesson } from "@/lib/ai.functions";
import { awardXP, markLessonDone, useProfile } from "@/lib/profile";
import { buildCurriculum } from "@/lib/curriculum";
import { IgnoOwl } from "@/components/Igno";

export const Route = createFileRoute("/leccion/$id")({
  head: () => ({ meta: [{ title: "Lección — IGNOTO" }] }),
  component: Lesson,
});

interface LessonShape {
  title: string; objective: string; story: string; heroImagePrompt: string;
  sections: { kind: string; title: string; body: string }[];
  quiz: { type: string; question: string; options: string[]; answerIndex: number; explanation: string }[];
  celebration: string;
}

function Lesson() {
  const { id } = useParams({ from: "/leccion/$id" });
  const profile = useProfile();
  const nav = useNavigate();
  const gen = useServerFn(generateLesson);
  const [lesson, setLesson] = useState<LessonShape | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [stage, setStage] = useState<"reading" | "quiz" | "done">("reading");
  const [qIdx, setQIdx] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [correct, setCorrect] = useState(0);

  useEffect(() => {
    if (!profile) return;
    const node = buildCurriculum(profile).find((n) => n.id === id);
    if (!node) { setError("Lección no encontrada"); return; }
    setLesson(null); setError(null); setStage("reading"); setQIdx(0); setPicked(null); setCorrect(0);
    gen({ data: {
      lessonId: id, subject: node.subjectLabel, topic: node.topic,
      childName: profile.childName, age: profile.age, level: profile.level,
      interests: profile.interests, difficulty: node.difficulty,
      language: profile.language,
    }}).then((r) => setLesson(r.lesson as LessonShape))
      .catch((e) => setError(e instanceof Error ? e.message : "Error generando la lección"));
  }, [id, profile, gen]);

  if (!profile) return <Loader text="Cargando perfil…" />;
  if (error) return (
    <main className="max-w-2xl mx-auto px-4 py-10 text-center">
      <div className="text-6xl">😕</div>
      <p className="mt-3 font-bold">{error}</p>
      <Link to="/dashboard" className="inline-block mt-5 rounded-full bg-primary text-primary-foreground px-5 py-2.5 font-bold">Volver</Link>
    </main>
  );
  if (!lesson) return <Loader text="IGNO está creando tu lección…" />;

  function pickAnswer(i: number) {
    if (!lesson || picked !== null) return;
    setPicked(i);
    if (i === lesson.quiz[qIdx].answerIndex) setCorrect((c) => c + 1);
  }
  function nextQ() {
    if (!lesson) return;
    if (qIdx + 1 >= lesson.quiz.length) {
      const xp = 20 + correct * 4 + (picked === lesson.quiz[qIdx].answerIndex ? 4 : 0);
      awardXP(xp); markLessonDone(id);
      setStage("done");
    } else { setQIdx((i) => i + 1); setPicked(null); }
  }

  return (
    <main className="max-w-2xl mx-auto px-4 py-6 pb-24">
      {stage === "reading" && (
        <article className="space-y-5 animate-pop-in">
          <div className="rounded-3xl overflow-hidden bg-gradient-hero p-6 text-primary-foreground shadow-soft">
            <div className="text-xs font-bold uppercase opacity-90 tracking-wider">Misión</div>
            <h1 className="font-display text-3xl font-bold mt-1">{lesson.title}</h1>
            <p className="mt-2 opacity-90 text-sm">{lesson.objective}</p>
          </div>
          <div className="rounded-3xl bg-coral text-coral-foreground p-5 shadow-soft">
            <div className="text-xs font-bold uppercase opacity-90 mb-1">📖 Historia</div>
            <p className="leading-relaxed">{lesson.story}</p>
          </div>
          {lesson.sections.map((s, i) => (
            <div key={i} className="rounded-3xl bg-card border border-border p-5 animate-pop-in" style={{ animationDelay: `${i * 80}ms` }}>
              <div className="text-xs font-bold uppercase tracking-wider text-primary mb-1">
                {s.kind === "funFact" ? "💡 Dato curioso" : s.kind === "analogy" ? "🔗 Analogía" : s.kind === "miniChallenge" ? "⚡ Mini reto" : "📚 Explicación"}
              </div>
              <h3 className="font-display text-lg font-bold mb-1">{s.title}</h3>
              <p className="text-sm leading-relaxed text-foreground/90">{s.body}</p>
            </div>
          ))}
          <button onClick={() => setStage("quiz")} className="w-full rounded-full bg-primary text-primary-foreground py-4 font-bold text-lg shadow-pop hover:translate-y-0.5 hover:shadow-none transition-all">
            ¡Al quiz! →
          </button>
        </article>
      )}

      {stage === "quiz" && (
        <div className="animate-pop-in">
          <div className="text-xs text-muted-foreground font-bold mb-2">Pregunta {qIdx + 1} de {lesson.quiz.length}</div>
          <div className="h-2 bg-muted rounded-full mb-5 overflow-hidden"><div className="h-full bg-gradient-hero transition-all" style={{ width: `${((qIdx + 1) / lesson.quiz.length) * 100}%` }} /></div>
          <h2 className="font-display text-2xl font-bold mb-5">{lesson.quiz[qIdx].question}</h2>
          <div className="space-y-2.5">
            {lesson.quiz[qIdx].options.map((o, i) => {
              const isAnswer = i === lesson.quiz[qIdx].answerIndex;
              const isPick = picked === i;
              const cls = picked === null
                ? "border-border hover:border-primary hover:bg-primary/5"
                : isAnswer ? "border-mint bg-mint/20"
                : isPick ? "border-destructive bg-destructive/10"
                : "border-border opacity-60";
              return (
                <button key={i} onClick={() => pickAnswer(i)} disabled={picked !== null}
                  className={`w-full text-left rounded-2xl border-2 p-4 font-semibold transition-all ${cls}`}>
                  {o} {picked !== null && isAnswer && <span className="float-right">✓</span>}
                </button>
              );
            })}
          </div>
          {picked !== null && (
            <>
              <div className="mt-4 rounded-2xl bg-muted p-4 text-sm animate-pop-in">
                <div className="font-bold mb-1">{picked === lesson.quiz[qIdx].answerIndex ? "¡Correcto! 🎉" : "Casi… 💭"}</div>
                <p className="text-muted-foreground">{lesson.quiz[qIdx].explanation}</p>
              </div>
              <button onClick={nextQ} className="mt-4 w-full rounded-full bg-primary text-primary-foreground py-3.5 font-bold shadow-pop">
                {qIdx + 1 >= lesson.quiz.length ? "Terminar" : "Siguiente →"}
              </button>
            </>
          )}
        </div>
      )}

      {stage === "done" && (
        <div className="text-center py-10 animate-pop-in">
          <div className="text-7xl animate-bounce-slow">🎉</div>
          <h2 className="font-display text-3xl font-bold mt-4">{lesson.celebration}</h2>
          <p className="mt-2 text-muted-foreground">Acertaste {correct} de {lesson.quiz.length}</p>
          <div className="mt-5 inline-flex gap-3">
            <span className="rounded-full bg-accent text-accent-foreground px-4 py-2 font-bold">+{20 + correct * 4} XP</span>
            <span className="rounded-full bg-coral text-coral-foreground px-4 py-2 font-bold">+{Math.floor((20 + correct * 4) / 5)} 🪙</span>
          </div>
          <div className="mt-8 flex gap-3 justify-center">
            <Link to="/mapa" className="rounded-full bg-card border-2 border-border px-5 py-3 font-bold">Ver mapa</Link>
            <Link to="/dashboard" className="rounded-full bg-primary text-primary-foreground px-5 py-3 font-bold shadow-pop">Inicio</Link>
          </div>
        </div>
      )}
    </main>
  );
}

function Loader({ text }: { text: string }) {
  return (
    <main className="min-h-[70vh] grid place-items-center text-center px-4">
      <div>
        <div className="animate-bounce-slow"><IgnoOwl size={120} /></div>
        <p className="mt-4 font-display text-lg font-bold">{text}</p>
        <p className="text-sm text-muted-foreground mt-1">IGNO está mezclando tus intereses con la magia de la IA…</p>
      </div>
    </main>
  );
}
