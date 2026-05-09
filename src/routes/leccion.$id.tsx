import { createFileRoute, Link, useNavigate, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { generateLesson, generateHeroImage } from "@/lib/ai.functions";
import { awardXP, markLessonDone, useProfile } from "@/lib/profile";
import { buildCurriculum } from "@/lib/curriculum";
import { IgnoOwl } from "@/components/Igno";
import { GenButton, GenCard, GenProgress, GenQuizOption, GenReaction, GenThemeBanner, useGenTheme } from "@/components/gen-ui/primitives";
import { useUIAgent } from "@/lib/use-ui-agent";

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
  const genImg = useServerFn(generateHeroImage);
  const [lesson, setLesson] = useState<LessonShape | null>(null);
  const [heroUrl, setHeroUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [stage, setStage] = useState<"reading" | "quiz" | "done">("reading");
  const [qIdx, setQIdx] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [streakRun, setStreakRun] = useState(0);
  const theme = useGenTheme();
  const { reaction, emit, clear } = useUIAgent(profile, theme, lesson?.title);

  useEffect(() => {
    if (!profile) return;
    const node = buildCurriculum(profile).find((n) => n.id === id);
    if (!node) { setError("Lección no encontrada"); return; }
    setLesson(null); setHeroUrl(null); setError(null); setStage("reading"); setQIdx(0); setPicked(null); setCorrect(0);
    gen({ data: {
      lessonId: id, subject: node.subjectLabel, topic: node.topic,
      childName: profile.childName, age: profile.age, level: profile.level,
      interests: profile.interests, difficulty: node.difficulty,
      language: profile.language,
    }}).then((r) => {
        const lsn = r.lesson as LessonShape;
        setLesson(lsn);
        const promptText = lsn.heroImagePrompt || `${node.subjectLabel}: ${lsn.title}`;
        genImg({ data: { prompt: promptText, interests: profile.interests } })
          .then((res) => { if (res.url) setHeroUrl(res.url); })
          .catch(() => {});
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Error generando la lección"));
  }, [id, profile, gen, genImg]);

  if (!profile) return <Loader text="Cargando perfil…" />;
  if (error) return (
    <main className="max-w-2xl mx-auto px-4 py-10 text-center">
      <div className="text-6xl">😕</div>
      <p className="mt-3 font-bold">{error}</p>
      <Link to="/dashboard" className="inline-block mt-5 rounded-full bg-primary text-primary-foreground px-5 py-2.5 font-bold">Volver</Link>
    </main>
  );
  if (!lesson) return <Loader text={`Personalizando para ${profile.childName}…`} />;

  function pickAnswer(i: number) {
    if (!lesson || picked !== null) return;
    setPicked(i);
    const isCorrect = i === lesson.quiz[qIdx].answerIndex;
    if (isCorrect) {
      const newCorrect = correct + 1;
      const newRun = streakRun + 1;
      setCorrect(newCorrect); setStreakRun(newRun);
      emit(newRun >= 3 ? "streak" : "correct", {
        correctSoFar: newCorrect, wrongSoFar: wrong,
        questionIndex: qIdx, questionTotal: lesson.quiz.length,
      });
    } else {
      const newWrong = wrong + 1;
      setWrong(newWrong); setStreakRun(0);
      emit("wrong", {
        correctSoFar: correct, wrongSoFar: newWrong,
        questionIndex: qIdx, questionTotal: lesson.quiz.length,
      });
    }
  }
  function nextQ() {
    if (!lesson) return;
    if (qIdx + 1 >= lesson.quiz.length) {
      const xp = 20 + correct * 4 + (picked === lesson.quiz[qIdx].answerIndex ? 4 : 0);
      awardXP(xp); markLessonDone(id);
      setStage("done");
      emit("complete", { correctSoFar: correct, wrongSoFar: wrong, questionIndex: qIdx + 1, questionTotal: lesson.quiz.length });
    } else { setQIdx((i) => i + 1); setPicked(null); }
  }

  return (
    <main className="max-w-2xl mx-auto px-4 py-6 pb-24">
      <GenReaction reaction={reaction} onDone={clear} />
      <div className="mb-5"><GenThemeBanner /></div>
      {stage === "reading" && (
        <article className="space-y-5 animate-pop-in">
          <div className="rounded-3xl overflow-hidden bg-gradient-hero text-primary-foreground shadow-soft">
            {heroUrl ? (
              <div className="relative aspect-[16/9] w-full">
                <img src={heroUrl} alt={lesson.title} className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/30 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <div className="text-[10px] font-bold uppercase opacity-90 tracking-wider">Misión</div>
                  <h1 className="font-display text-2xl md:text-3xl font-bold leading-tight">{lesson.title}</h1>
                  <p className="mt-1 opacity-90 text-sm">{lesson.objective}</p>
                </div>
              </div>
            ) : (
              <div className="p-6">
                <div className="text-xs font-bold uppercase opacity-90 tracking-wider">Misión</div>
                <h1 className="font-display text-3xl font-bold mt-1">{lesson.title}</h1>
                <p className="mt-2 opacity-90 text-sm">{lesson.objective}</p>
                <div className="mt-3 flex items-center gap-2 text-xs opacity-90">
                  <span className="inline-block w-3 h-3 rounded-full bg-accent animate-pulse" />
                  IGNO está pintando la portada…
                </div>
              </div>
            )}
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
          <GenButton onClick={() => { setStage("quiz"); emit("start"); }} className="w-full py-4 text-lg">
            ¡Al quiz! →
          </GenButton>
        </article>
      )}

      {stage === "quiz" && (
        <div className="animate-pop-in">
          <div className="text-xs text-muted-foreground font-bold mb-2">Pregunta {qIdx + 1} de {lesson.quiz.length}</div>
          <div className="mb-6"><GenProgress value={qIdx + 1} max={lesson.quiz.length} /></div>
          <h2 className="font-display text-2xl font-bold mb-5">{lesson.quiz[qIdx].question}</h2>
          <div className="space-y-2.5">
            {lesson.quiz[qIdx].options.map((o, i) => {
              const isAnswer = i === lesson.quiz[qIdx].answerIndex;
              const isPick = picked === i;
              const state: "idle" | "correct" | "picked-wrong" | "muted" =
                picked === null ? "idle"
                : isAnswer ? "correct"
                : isPick ? "picked-wrong"
                : "muted";
              return <GenQuizOption key={i} index={i} label={o} state={state}
                disabled={picked !== null} onPick={() => pickAnswer(i)} />;
            })}
          </div>
          {picked !== null && (
            <>
              <GenCard className="mt-4 text-sm" tone={picked === lesson.quiz[qIdx].answerIndex ? "mint" : "accent"}>
                <div className="font-bold mb-1">{picked === lesson.quiz[qIdx].answerIndex ? "¡Correcto! 🎉" : "Casi… 💭"}</div>
                <p className="opacity-80">{lesson.quiz[qIdx].explanation}</p>
              </GenCard>
              <GenButton onClick={nextQ} className="mt-4 w-full py-3.5">
                {qIdx + 1 >= lesson.quiz.length ? "Terminar" : "Siguiente →"}
              </GenButton>
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
