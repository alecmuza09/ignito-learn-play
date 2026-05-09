import { useState } from "react";
import { useCopilotAction, useCopilotReadable, useCopilotAdditionalInstructions } from "@copilotkit/react-core";
import { CopilotChat } from "@copilotkit/react-ui";
import { useProfile } from "@/lib/profile";
import { KawaiiBlob } from "./KawaiiBlob";
import { AnimatedSimulation, inferSimulationKind } from "./gen-ui/AnimatedSimulation";
import { SIMULATION_KINDS, type SimulationKind } from "@/lib/gen-blocks";

export function IgnoOwl({ size = 64, animate = true }: { size?: number; animate?: boolean }) {
  return (
    <div className={animate ? "animate-float" : ""}>
      <KawaiiBlob size={size} shape="blob" color="var(--primary)" mood="happy" />
    </div>
  );
}

export function IgnoFloating() {
  const profile = useProfile();
  const [open, setOpen] = useState(false);

  // Provide child profile context to the agent
  useCopilotReadable({
    description: "Perfil del niño que está usando IGNO",
    value: profile ? {
      childName: profile.childName,
      age: profile.age,
      interests: profile.interests,
      language: profile.language,
    } : null,
  });

  useCopilotAdditionalInstructions({
    instructions: `Eres IGNO, un tutor educativo cariñoso para niños de 4 a 12 años.
Hablas SIEMPRE en español, claro, con emojis y entusiasmo.
Para CADA respuesta DEBES llamar al menos UNA herramienta visual (presentSimulation, presentQuiz, presentTryIt o presentStorySteps) ANTES de tu texto final, para que la lección sea visual y dinámica.
- Usa presentSimulation para conceptos científicos, matemáticos o naturales.
- Usa presentQuiz para verificar comprensión con opción múltiple (3-4 opciones).
- Usa presentTryIt para retos cortos donde el niño escriba o elija.
- Usa presentStorySteps para narrativas o procesos paso a paso.
NO repitas el mismo tipo de animación dos veces seguidas. Elige siempre el "kind" más específico.
Mantén tus mensajes de texto cortos (1-3 frases) — la animación hace el trabajo pesado.${profile ? `
Contexto: el niño se llama ${profile.childName}, tiene ${profile.age} años y le gustan: ${profile.interests.join(", ")}.` : ""}`,
  });

  // === TOOL 1: Simulation ===
  useCopilotAction({
    name: "presentSimulation",
    description: "Muestra una animación SVG educativa relacionada con el tema. Elige el 'kind' MÁS específico posible.",
    parameters: [
      { name: "kind", type: "string", description: `Tipo de animación. Opciones: ${SIMULATION_KINDS.join(", ")}`, required: true },
      { name: "title", type: "string", description: "Título corto (3-6 palabras)", required: true },
      { name: "caption", type: "string", description: "Frase breve que explica qué muestra", required: false },
      { name: "steps", type: "string[]", description: "Pasos opcionales (2-4 strings cortos)", required: false },
    ],
    render: ({ args }) => {
      const k = (args.kind as SimulationKind) ?? inferSimulationKind(args.title ?? "");
      const safeKind = SIMULATION_KINDS.includes(k) ? k : inferSimulationKind(`${args.title ?? ""} ${args.caption ?? ""}`);
      return (
        <AnimatedSimulation
          kind={safeKind}
          title={args.title ?? "Animación"}
          caption={args.caption}
          steps={args.steps}
          compact
          hint={`${args.title ?? ""} ${args.caption ?? ""}`}
        />
      );
    },
  });

  // === TOOL 2: Quiz ===
  useCopilotAction({
    name: "presentQuiz",
    description: "Muestra una pregunta de opción múltiple para el niño. Da feedback al elegir.",
    parameters: [
      { name: "question", type: "string", required: true },
      { name: "options", type: "string[]", description: "3 o 4 opciones", required: true },
      { name: "answerIndex", type: "number", description: "Índice (0-based) de la respuesta correcta", required: true },
      { name: "explanation", type: "string", description: "Explicación corta de la respuesta", required: false },
    ],
    render: ({ args }) => (
      <QuizCard
        question={args.question ?? ""}
        options={args.options ?? []}
        answerIndex={args.answerIndex ?? 0}
        explanation={args.explanation}
      />
    ),
  });

  // === TOOL 3: Try It ===
  useCopilotAction({
    name: "presentTryIt",
    description: "Reto corto donde el niño escribe una respuesta. Valida ignorando mayúsculas y espacios.",
    parameters: [
      { name: "question", type: "string", required: true },
      { name: "answer", type: "string", description: "Respuesta esperada", required: true },
      { name: "hint", type: "string", required: false },
      { name: "explanation", type: "string", required: false },
    ],
    render: ({ args }) => (
      <TryItCard
        question={args.question ?? ""}
        answer={args.answer ?? ""}
        hint={args.hint}
        explanation={args.explanation}
      />
    ),
  });

  // === TOOL 4: Story Steps ===
  useCopilotAction({
    name: "presentStorySteps",
    description: "Narrativa secuencial: muestra pasos uno por uno con botón 'Siguiente'.",
    parameters: [
      { name: "title", type: "string", required: true },
      { name: "steps", type: "string[]", description: "3-6 pasos cortos en orden", required: true },
      { name: "emoji", type: "string", description: "Emoji decorativo", required: false },
    ],
    render: ({ args }) => (
      <StoryStepsCard
        title={args.title ?? ""}
        steps={args.steps ?? []}
        emoji={args.emoji ?? "✨"}
      />
    ),
  });

  if (!profile) return null;

  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-5 right-5 z-50 rounded-full bg-card border-4 border-primary shadow-soft p-2 hover:scale-110 transition-transform"
        aria-label="Hablar con IGNO"
      >
        <KawaiiBlob size={48} shape="blob" color="var(--primary)" mood="happy" />
      </button>
      {open && (
        <div className="fixed bottom-28 right-5 z-50 w-[min(420px,calc(100vw-2rem))] h-[min(620px,calc(100vh-10rem))] bg-card rounded-3xl shadow-soft border-2 border-primary/20 overflow-hidden animate-pop-in flex flex-col igno-copilot">
          <div className="bg-primary p-3 text-primary-foreground flex items-center gap-3 flex-shrink-0">
            <div className="bg-primary-foreground/15 rounded-full p-1">
              <KawaiiBlob size={32} shape="blob" color="var(--primary-foreground)" mood="wink" />
            </div>
            <div className="flex-1">
              <h3 className="font-display font-bold leading-tight">IGNO</h3>
              <p className="text-xs opacity-90">Tu tutor con superpoderes</p>
            </div>
            <button onClick={() => setOpen(false)} className="text-2xl leading-none opacity-80 hover:opacity-100">×</button>
          </div>
          <div className="flex-1 overflow-hidden">
            <CopilotChat
              className="h-full"
              labels={{
                title: "IGNO",
                initial: `¡Hola ${profile.childName}! Pregúntame lo que sea — te respondo con animaciones, quizzes y retos ✨`,
                placeholder: "¿Qué quieres aprender hoy?",
              }}
            />
          </div>
        </div>
      )}
    </>
  );
}

// ============= GEN-UI CARDS =============

function QuizCard({ question, options, answerIndex, explanation }: { question: string; options: string[]; answerIndex: number; explanation?: string }) {
  const [picked, setPicked] = useState<number | null>(null);
  return (
    <div className="rounded-2xl bg-card border-2 border-primary/30 p-3 my-2 animate-pop-in">
      <p className="font-bold text-sm mb-2">🎯 {question}</p>
      <div className="grid gap-1.5">
        {options.map((opt, i) => {
          const isPicked = picked === i;
          const isCorrect = i === answerIndex;
          const showState = picked !== null;
          let cls = "text-left text-sm rounded-xl px-3 py-2 border-2 transition ";
          if (!showState) cls += "border-border bg-muted hover:bg-primary/10 hover:border-primary/40";
          else if (isCorrect) cls += "border-mint bg-mint/20 text-mint-foreground font-semibold";
          else if (isPicked) cls += "border-destructive bg-destructive/10 text-destructive";
          else cls += "border-border bg-muted opacity-60";
          return (
            <button key={i} disabled={picked !== null} onClick={() => setPicked(i)} className={cls}>
              {showState && (isCorrect ? "✅ " : isPicked ? "❌ " : "")}{opt}
            </button>
          );
        })}
      </div>
      {picked !== null && explanation && (
        <p className="mt-2 text-xs bg-accent/15 border border-accent/30 rounded-lg px-2 py-1.5">💡 {explanation}</p>
      )}
    </div>
  );
}

function TryItCard({ question, answer, hint, explanation }: { question: string; answer: string; hint?: string; explanation?: string }) {
  const [val, setVal] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const norm = (s: string) => s.trim().toLowerCase().replace(/\s+/g, " ");
  const correct = submitted && norm(val) === norm(answer);
  return (
    <div className="rounded-2xl bg-card border-2 border-secondary/30 p-3 my-2 animate-pop-in">
      <p className="font-bold text-sm mb-2">✏️ {question}</p>
      {hint && <p className="text-xs text-muted-foreground mb-1.5">Pista: {hint}</p>}
      <form onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }} className="flex gap-1.5">
        <input
          value={val}
          onChange={(e) => { setVal(e.target.value); setSubmitted(false); }}
          className="flex-1 rounded-lg bg-muted px-2.5 py-1.5 text-sm outline-none focus:ring-2 ring-primary"
          placeholder="Tu respuesta…"
        />
        <button type="submit" className="rounded-lg bg-primary text-primary-foreground px-3 text-sm font-bold">OK</button>
      </form>
      {submitted && (
        <p className={`mt-2 text-xs rounded-lg px-2 py-1.5 ${correct ? "bg-mint/20 text-mint-foreground" : "bg-destructive/10 text-destructive"}`}>
          {correct ? `✅ ¡Correcto! ${explanation ?? ""}` : `❌ Casi… la respuesta es "${answer}". ${explanation ?? ""}`}
        </p>
      )}
    </div>
  );
}

function StoryStepsCard({ title, steps, emoji }: { title: string; steps: string[]; emoji: string }) {
  const [idx, setIdx] = useState(0);
  const last = idx >= steps.length - 1;
  return (
    <div className="rounded-2xl bg-card border-2 border-accent/30 p-3 my-2 animate-pop-in">
      <p className="font-bold text-sm mb-2">{emoji} {title}</p>
      <div className="bg-muted rounded-xl p-2.5 text-sm min-h-[3rem]">
        <span className="text-xs text-muted-foreground font-mono mr-1">{idx + 1}/{steps.length}</span>
        {steps[idx]}
      </div>
      <div className="mt-2 flex justify-between items-center">
        <div className="flex gap-1">
          {steps.map((_, i) => (
            <span key={i} className={`w-1.5 h-1.5 rounded-full ${i <= idx ? "bg-primary" : "bg-muted"}`} />
          ))}
        </div>
        <button
          onClick={() => setIdx((i) => Math.min(i + 1, steps.length - 1))}
          disabled={last}
          className="text-xs rounded-full bg-primary text-primary-foreground px-3 py-1 font-bold disabled:opacity-40"
        >
          {last ? "¡Listo!" : "Siguiente →"}
        </button>
      </div>
    </div>
  );
}
