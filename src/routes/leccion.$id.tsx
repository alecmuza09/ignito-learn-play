import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { generateLesson, generateHeroImage } from "@/lib/ai.functions";
import { awardXP, markLessonDone, useProfile } from "@/lib/profile";
import { buildCurriculum } from "@/lib/curriculum";
import { GenButton, GenProgress, GenReaction, GenThemeBanner, useGenTheme } from "@/components/gen-ui/primitives";
import { GenRenderer, collectImageJobs } from "@/components/gen-ui/GenRenderer";
import { useUIAgent } from "@/lib/use-ui-agent";
import { KawaiiBlob } from "@/components/gen-ui/KawaiiBlob";
import type { GenBlock, MiniQuizBlock, TryItBlock, StyleSpec } from "@/lib/gen-blocks";
import { newId } from "@/lib/gen-blocks";

export const Route = createFileRoute("/leccion/$id")({
  head: () => ({ meta: [{ title: "Lección — IGNOTO" }] }),
  component: Lesson,
});

function Lesson() {
  const { id } = useParams({ from: "/leccion/$id" });
  const profile = useProfile();
  const gen = useServerFn(generateLesson);
  const genImg = useServerFn(generateHeroImage);
  const [title, setTitle] = useState<string>("");
  const [objective, setObjective] = useState<string>("");
  const [celebration, setCelebration] = useState<string>("");
  const [blocks, setBlocks] = useState<GenBlock[] | null>(null);
  const [finalQuiz, setFinalQuiz] = useState<MiniQuizBlock[]>([]);
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({});
  const [styleSpec, setStyleSpec] = useState<StyleSpec | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [stage, setStage] = useState<"reading" | "quiz" | "done">("reading");
  const [qIdx, setQIdx] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [streakRun, setStreakRun] = useState(0);
  const theme = useGenTheme();
  const { reaction, action, emit, clear } = useUIAgent(profile, theme, title);

  // Generate images for blocks as they appear.
  useEffect(() => {
    if (!blocks || !profile) return;
    const jobs = collectImageJobs(blocks).filter((j) => !imageUrls[j.key]).slice(0, 2);
    jobs.forEach((j) => {
      genImg({ data: { prompt: j.prompt, interests: profile.interests, styleSpec } })
        .then((res) => { if (res.url) setImageUrls((prev) => ({ ...prev, [j.key]: res.url })); })
        .catch(() => {});
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blocks, profile?.interests, styleSpec]);

  useEffect(() => {
    if (!profile) return;
    const node = buildCurriculum(profile).find((n) => n.id === id);
    if (!node) { setError("Lección no encontrada"); return; }
    setBlocks(null); setFinalQuiz([]); setImageUrls({}); setError(null);
    setStyleSpec(undefined);
    setStage("reading"); setQIdx(0); setPicked(null); setCorrect(0); setWrong(0); setStreakRun(0);
    gen({ data: {
      lessonId: id, subject: node.subjectLabel, topic: node.topic,
      childName: profile.childName, age: profile.age, level: profile.level,
      interests: profile.interests, difficulty: node.difficulty,
      language: profile.language, style: profile.style,
    }})
      .then((r) => {
        setTitle(r.lesson.title);
        setObjective(r.lesson.objective);
        setCelebration(r.lesson.celebration);
        setStyleSpec(r.lesson.styleSpec);
        setBlocks(r.lesson.blocks);
        setFinalQuiz(r.lesson.finalQuiz);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Error generando la lección"));
  }, [id, profile, gen]);

  // Apply agent layout mutations live.
  useEffect(() => {
    if (!action || action.kind !== "insertBlock") return;
    setBlocks((prev) => {
      if (!prev) return prev;
      const block = { ...action.block, id: action.block.id || newId("ag"), agentInserted: true };
      if (action.at === "end") return [...prev, block];
      // after-current: insert near end of body for now
      return [...prev, block];
    });
  }, [action]);

  if (!profile) return <Loader text="Cargando perfil…" />;
  if (error) return (
    <main className="max-w-2xl mx-auto px-4 py-10 text-center">
      <div className="text-6xl">😕</div>
      <p className="mt-3 font-bold">{error}</p>
      <Link to="/dashboard" className="inline-block mt-5 rounded-full bg-primary text-primary-foreground px-5 py-2.5 font-bold">Volver</Link>
    </main>
  );
  if (!blocks) return <Loader text={`Personalizando para ${profile.childName}…`} />;

  const focusLabel = profile.style?.focus === "5" ? "5 min" : profile.style?.focus === "10" ? "10 min" : profile.style?.focus === "15" ? "15 min" : "30 min";
  const formatLabel =
    profile.style?.format === "video" ? "más imágenes"
    : profile.style?.format === "leer" ? "más lectura"
    : profile.style?.format === "jugar" ? "más mini-retos"
    : "mezcla";

  function onTryIt(_b: TryItBlock, isCorrect: boolean) {
    if (isCorrect) {
      const newRun = streakRun + 1;
      setStreakRun(newRun);
      emit(newRun >= 3 ? "streak" : "correct", { correctSoFar: correct, wrongSoFar: wrong, questionIndex: 0, questionTotal: 0 });
    } else {
      setStreakRun(0);
      emit("wrong", { correctSoFar: correct, wrongSoFar: wrong + 1, questionIndex: 0, questionTotal: 0 });
    }
  }

  function pickAnswer(i: number) {
    if (picked !== null) return;
    const q = finalQuiz[qIdx];
    if (!q) return;
    setPicked(i);
    const isCorrect = i === q.answerIndex;
    if (isCorrect) {
      const newCorrect = correct + 1;
      const newRun = streakRun + 1;
      setCorrect(newCorrect); setStreakRun(newRun);
      emit(newRun >= 3 ? "streak" : "correct", {
        correctSoFar: newCorrect, wrongSoFar: wrong,
        questionIndex: qIdx, questionTotal: finalQuiz.length,
      });
    } else {
      const newWrong = wrong + 1;
      setWrong(newWrong); setStreakRun(0);
      emit("wrong", {
        correctSoFar: correct, wrongSoFar: newWrong,
        questionIndex: qIdx, questionTotal: finalQuiz.length,
      });
    }
  }
  function nextQ() {
    const q = finalQuiz[qIdx];
    if (!q) return;
    if (qIdx + 1 >= finalQuiz.length) {
      const xp = 20 + correct * 4 + (picked === q.answerIndex ? 4 : 0);
      awardXP(xp); markLessonDone(id);
      setStage("done");
      emit("complete", { correctSoFar: correct, wrongSoFar: wrong, questionIndex: qIdx + 1, questionTotal: finalQuiz.length });
    } else { setQIdx((i) => i + 1); setPicked(null); }
  }

  return (
    <main className="max-w-2xl mx-auto px-4 py-6 pb-24">
      <GenReaction reaction={reaction} onDone={clear} />
      <div className="mb-5">
        <GenThemeBanner subtitle={
          styleSpec?.vibe
            ? `Hoy: ${styleSpec.vibe} · ${focusLabel} · ${formatLabel}`
            : `Hoy: ${focusLabel} · ${formatLabel} · IA componiendo en vivo`
        } />
      </div>

      {stage === "reading" && (
        <>
          <GenRenderer blocks={blocks} imageUrls={imageUrls} onTryItDone={onTryIt} />
          <GenButton onClick={() => { setStage("quiz"); emit("start"); }} className="mt-6 w-full py-4 text-lg">
            ¡Al quiz final! →
          </GenButton>
        </>
      )}

      {stage === "quiz" && finalQuiz[qIdx] && (
        <div className="animate-pop-in">
          <div className="text-xs text-muted-foreground font-bold mb-2">Pregunta {qIdx + 1} de {finalQuiz.length}</div>
          <div className="mb-6"><GenProgress value={qIdx + 1} max={finalQuiz.length} /></div>
          <h2 className="font-display text-2xl font-bold mb-5">{finalQuiz[qIdx].question}</h2>
          <div className="space-y-2.5">
            {finalQuiz[qIdx].options.map((o, i) => {
              const isAnswer = i === finalQuiz[qIdx].answerIndex;
              const isPick = picked === i;
              const cls =
                picked === null ? "border-border hover:border-primary hover:bg-primary/5"
                : isAnswer ? "border-mint bg-mint/25"
                : isPick ? "border-destructive bg-destructive/15"
                : "border-border opacity-50";
              return (
                <button key={i} disabled={picked !== null} onClick={() => pickAnswer(i)}
                  className={`w-full text-left rounded-2xl border-2 p-4 font-semibold transition ${cls}`}>
                  <span className="inline-block w-7 h-7 rounded-lg bg-muted text-foreground text-xs grid place-items-center mr-2 align-middle">
                    {String.fromCharCode(65+i)}
                  </span>
                  {o}
                </button>
              );
            })}
          </div>
          {picked !== null && (
            <>
              <div className={`mt-4 rounded-2xl p-4 text-sm ${picked === finalQuiz[qIdx].answerIndex ? "bg-mint/20" : "bg-accent/15"}`}>
                <div className="font-bold mb-1">{picked === finalQuiz[qIdx].answerIndex ? "¡Correcto! 🎉" : "Casi… 💭"}</div>
                <p className="opacity-80">{finalQuiz[qIdx].explanation}</p>
              </div>
              <GenButton onClick={nextQ} className="mt-4 w-full py-3.5">
                {qIdx + 1 >= finalQuiz.length ? "Terminar" : "Siguiente →"}
              </GenButton>
            </>
          )}
        </div>
      )}

      {stage === "done" && (
        <div className="text-center py-10 animate-pop-in">
          <div className="text-7xl animate-bounce-slow">🎉</div>
          <h2 className="font-display text-3xl font-bold mt-4">{celebration}</h2>
          <p className="mt-2 text-muted-foreground">Acertaste {correct} de {finalQuiz.length}</p>
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

      {/* objective hint for screen readers / context preserved */}
      <span className="sr-only">{objective}</span>
    </main>
  );
}

function Loader({ text }: { text: string }) {
  const theme = useGenTheme();
  return (
    <main className="min-h-[70vh] grid place-items-center text-center px-4 relative overflow-hidden">
      <div>
        <div className="animate-bounce-slow"><KawaiiBlob size={140} mood="wow" /></div>
        <p className="mt-5 font-display text-2xl font-bold tracking-tight">{text}</p>
        <p className="text-sm text-muted-foreground mt-1">Mezclando tu mundo de <span className="font-bold text-foreground">{theme.label}</span> con la IA…</p>
      </div>
    </main>
  );
}