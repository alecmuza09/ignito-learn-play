import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
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

type ToolCall = { name: string; args: Record<string, unknown> };
type ChatEntry = {
  id: string;
  role: "user" | "assistant";
  text?: string;
  tool?: ToolCall;
  pending?: boolean;
};

type RuntimeMessage = {
  __typename?: string;
  role?: string;
  content?: string[] | string;
  name?: string;
  arguments?: unknown[] | string;
};

const VISUAL_ACTIONS = [
  {
    name: "presentSimulation",
    description:
      "Muestra una animación SVG educativa relacionada con el tema. Elige el kind MÁS específico posible.",
    jsonSchema: JSON.stringify({
      type: "object",
      properties: {
        kind: { type: "string", enum: SIMULATION_KINDS },
        title: { type: "string" },
        caption: { type: "string" },
        steps: { type: "array", items: { type: "string" }, minItems: 2, maxItems: 4 },
      },
      required: ["kind", "title"],
    }),
  },
  {
    name: "presentQuiz",
    description: "Muestra una pregunta de opción múltiple concreta sobre lo que el niño preguntó.",
    jsonSchema: JSON.stringify({
      type: "object",
      properties: {
        question: { type: "string" },
        options: { type: "array", items: { type: "string" }, minItems: 3, maxItems: 4 },
        answerIndex: { type: "number" },
        explanation: { type: "string" },
      },
      required: ["question", "options", "answerIndex"],
    }),
  },
  {
    name: "presentTryIt",
    description: "Reto corto donde el niño escribe una respuesta relacionada con el tema.",
    jsonSchema: JSON.stringify({
      type: "object",
      properties: {
        question: { type: "string" },
        answer: { type: "string" },
        hint: { type: "string" },
        explanation: { type: "string" },
      },
      required: ["question", "answer"],
    }),
  },
  {
    name: "presentStorySteps",
    description: "Narrativa secuencial: muestra pasos uno por uno sobre un proceso concreto.",
    jsonSchema: JSON.stringify({
      type: "object",
      properties: {
        title: { type: "string" },
        steps: { type: "array", items: { type: "string" }, minItems: 3, maxItems: 6 },
        emoji: { type: "string" },
      },
      required: ["title", "steps"],
    }),
  },
];

function makeId(prefix: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto)
    return `${prefix}-${crypto.randomUUID()}`;
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function asText(content: RuntimeMessage["content"]) {
  if (Array.isArray(content)) return content.join("\n");
  return typeof content === "string" ? content : "";
}

function parseToolArgs(value: RuntimeMessage["arguments"]): Record<string, unknown> {
  const raw = Array.isArray(value) ? value[0] : value;
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw) as unknown;
      return parsed && typeof parsed === "object" && !Array.isArray(parsed)
        ? (parsed as Record<string, unknown>)
        : {};
    } catch {
      return {};
    }
  }
  return raw && typeof raw === "object" && !Array.isArray(raw)
    ? (raw as Record<string, unknown>)
    : {};
}

function isSimulationKind(kind: unknown): kind is SimulationKind {
  return typeof kind === "string" && SIMULATION_KINDS.includes(kind as SimulationKind);
}

function normalizeResponseMessages(messages: RuntimeMessage[], fallbackText: string): ChatEntry[] {
  const entries = messages.flatMap((message) => {
    if (message.__typename === "ActionExecutionMessageOutput" || message.name) {
      return [
        {
          id: makeId("tool"),
          role: "assistant" as const,
          tool: {
            name: message.name ?? "presentSimulation",
            args: parseToolArgs(message.arguments),
          },
        },
      ];
    }
    const text = asText(message.content).trim();
    if (text) return [{ id: makeId("assistant"), role: "assistant" as const, text }];
    return [];
  });

  return entries.length
    ? entries
    : [{ id: makeId("assistant"), role: "assistant", text: fallbackText }];
}

export function IgnoFloating() {
  const profile = useProfile();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [entries, setEntries] = useState<ChatEntry[]>([]);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const threadId = useMemo(() => makeId("thread"), []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [entries, sending, open]);

  if (!profile) return null;

  const sendMessage = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const text = input.trim();
    if (!text || sending) return;

    const userEntry: ChatEntry = { id: makeId("user"), role: "user", text };
    const pendingEntry: ChatEntry = { id: makeId("pending"), role: "assistant", pending: true };
    setInput("");
    setSending(true);
    setEntries((current) => [...current, userEntry, pendingEntry]);

    try {
      const recent = entries
        .filter((entry) => entry.text)
        .slice(-6)
        .map((entry) => ({
          textMessage: { role: entry.role, content: entry.text ?? "" },
        }));

      const response = await fetch("/api/copilotkit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          operationName: "generateCopilotResponse",
          variables: {
            data: {
              threadId,
              messages: [...recent, { textMessage: { role: "user", content: text } }],
              frontend: { actions: VISUAL_ACTIONS },
              context: [
                {
                  description: "Perfil del niño que está usando IGNO",
                  value: JSON.stringify({
                    childName: profile.childName,
                    age: profile.age,
                    interests: profile.interests,
                    language: profile.language,
                  }),
                },
                {
                  description: "Reglas visuales de IGNO",
                  value: `Cada respuesta debe crear contenido muy dinámico: una animación SVG, quiz, reto o pasos directamente relacionados con la pregunta. Conecta el tema con estos gustos del niño: ${profile.interests.join(", ") || "intereses generales"}. Evita visuales genéricos.`,
                },
              ],
            },
          },
        }),
      });

      if (!response.ok) throw new Error("IGNO no pudo responder ahora.");
      const payload = (await response.json()) as {
        data?: { generateCopilotResponse?: { messages?: RuntimeMessage[] } };
        errors?: Array<{ message?: string }>;
      };
      if (payload.errors?.length)
        throw new Error(payload.errors[0]?.message ?? "Respuesta inválida");

      const messages = payload.data?.generateCopilotResponse?.messages ?? [];
      const assistantEntries = normalizeResponseMessages(
        messages,
        "¡Mira esta idea en movimiento! ¿Qué parte quieres explorar ahora?",
      );
      setEntries((current) =>
        current.filter((entry) => entry.id !== pendingEntry.id).concat(assistantEntries),
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "IGNO se quedó pensando. Inténtalo otra vez.";
      setEntries((current) =>
        current
          .filter((entry) => entry.id !== pendingEntry.id)
          .concat({
            id: makeId("error"),
            role: "assistant",
            text: `🦉 ${message}`,
          }),
      );
    } finally {
      setSending(false);
    }
  };

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
        <div className="fixed bottom-28 right-5 z-50 w-[min(420px,calc(100vw-2rem))] h-[min(620px,calc(100vh-10rem))] bg-card rounded-3xl shadow-soft border-2 border-primary/20 overflow-hidden animate-pop-in flex flex-col">
          <div className="bg-primary p-3 text-primary-foreground flex items-center gap-3 flex-shrink-0">
            <div className="bg-primary-foreground/15 rounded-full p-1">
              <KawaiiBlob size={32} shape="blob" color="var(--primary-foreground)" mood="wink" />
            </div>
            <div className="flex-1">
              <h3 className="font-display font-bold leading-tight">IGNO</h3>
              <p className="text-xs opacity-90">Tu tutor con superpoderes</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-2xl leading-none opacity-80 hover:opacity-100"
              aria-label="Cerrar chat"
            >
              ×
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-muted/30">
            {entries.length === 0 && (
              <div className="rounded-2xl bg-card border border-border p-3 text-sm leading-relaxed">
                ¡Hola {profile.childName}! Pregúntame lo que sea — te respondo con animaciones,
                quizzes y retos ✨
              </div>
            )}
            {entries.map((entry) => (
              <ChatBubble key={entry.id} entry={entry} />
            ))}
            <div ref={bottomRef} />
          </div>

          <form onSubmit={sendMessage} className="flex gap-2 border-t border-border bg-card p-3">
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              className="min-w-0 flex-1 rounded-2xl bg-muted px-3 py-2 text-sm outline-none focus:ring-2 ring-primary"
              placeholder="¿Qué quieres aprender hoy?"
              disabled={sending}
            />
            <button
              type="submit"
              disabled={sending || !input.trim()}
              className="rounded-2xl bg-primary text-primary-foreground px-4 py-2 text-sm font-bold disabled:opacity-50"
            >
              {sending ? "…" : "Enviar"}
            </button>
          </form>
        </div>
      )}
    </>
  );
}

function ChatBubble({ entry }: { entry: ChatEntry }) {
  if (entry.pending) {
    return (
      <div className="max-w-[86%] rounded-2xl bg-card border border-border px-3 py-2 text-sm animate-pulse">
        IGNO está dibujando una idea…
      </div>
    );
  }

  if (entry.tool) return <ToolRenderer tool={entry.tool} />;

  const mine = entry.role === "user";
  return (
    <div className={`flex ${mine ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[86%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${mine ? "bg-primary text-primary-foreground" : "bg-card border border-border"}`}
      >
        {entry.text}
      </div>
    </div>
  );
}

function ToolRenderer({ tool }: { tool: ToolCall }) {
  const args = tool.args;
  if (tool.name === "presentQuiz") {
    return (
      <QuizCard
        question={String(args.question ?? "")}
        options={Array.isArray(args.options) ? args.options.map(String) : []}
        answerIndex={Number(args.answerIndex ?? 0)}
        explanation={typeof args.explanation === "string" ? args.explanation : undefined}
      />
    );
  }

  if (tool.name === "presentTryIt") {
    return (
      <TryItCard
        question={String(args.question ?? "")}
        answer={String(args.answer ?? "")}
        hint={typeof args.hint === "string" ? args.hint : undefined}
        explanation={typeof args.explanation === "string" ? args.explanation : undefined}
      />
    );
  }

  if (tool.name === "presentStorySteps") {
    return (
      <StoryStepsCard
        title={String(args.title ?? "Historia paso a paso")}
        steps={Array.isArray(args.steps) ? args.steps.map(String) : []}
        emoji={typeof args.emoji === "string" ? args.emoji : "✨"}
      />
    );
  }

  const rawKind = args.kind;
  const title = String(args.title ?? "Animación");
  const caption = typeof args.caption === "string" ? args.caption : undefined;
  const safeKind = isSimulationKind(rawKind)
    ? rawKind
    : inferSimulationKind(`${title} ${caption ?? ""}`);
  return (
    <AnimatedSimulation
      kind={safeKind}
      title={title}
      caption={caption}
      steps={Array.isArray(args.steps) ? args.steps.map(String) : undefined}
      compact
      hint={`${title} ${caption ?? ""}`}
    />
  );
}

// ============= GEN-UI CARDS =============

function QuizCard({
  question,
  options,
  answerIndex,
  explanation,
}: {
  question: string;
  options: string[];
  answerIndex: number;
  explanation?: string;
}) {
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
          if (!showState)
            cls += "border-border bg-muted hover:bg-primary/10 hover:border-primary/40";
          else if (isCorrect) cls += "border-mint bg-mint/20 text-mint-foreground font-semibold";
          else if (isPicked) cls += "border-destructive bg-destructive/10 text-destructive";
          else cls += "border-border bg-muted opacity-60";
          return (
            <button key={i} disabled={picked !== null} onClick={() => setPicked(i)} className={cls}>
              {showState && (isCorrect ? "✅ " : isPicked ? "❌ " : "")}
              {opt}
            </button>
          );
        })}
      </div>
      {picked !== null && explanation && (
        <p className="mt-2 text-xs bg-accent/15 border border-accent/30 rounded-lg px-2 py-1.5">
          💡 {explanation}
        </p>
      )}
    </div>
  );
}

function TryItCard({
  question,
  answer,
  hint,
  explanation,
}: {
  question: string;
  answer: string;
  hint?: string;
  explanation?: string;
}) {
  const [val, setVal] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const norm = (s: string) => s.trim().toLowerCase().replace(/\s+/g, " ");
  const correct = submitted && norm(val) === norm(answer);
  return (
    <div className="rounded-2xl bg-card border-2 border-secondary/30 p-3 my-2 animate-pop-in">
      <p className="font-bold text-sm mb-2">✏️ {question}</p>
      {hint && <p className="text-xs text-muted-foreground mb-1.5">Pista: {hint}</p>}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setSubmitted(true);
        }}
        className="flex gap-1.5"
      >
        <input
          value={val}
          onChange={(e) => {
            setVal(e.target.value);
            setSubmitted(false);
          }}
          className="flex-1 rounded-lg bg-muted px-2.5 py-1.5 text-sm outline-none focus:ring-2 ring-primary"
          placeholder="Tu respuesta…"
        />
        <button
          type="submit"
          className="rounded-lg bg-primary text-primary-foreground px-3 text-sm font-bold"
        >
          OK
        </button>
      </form>
      {submitted && (
        <p
          className={`mt-2 text-xs rounded-lg px-2 py-1.5 ${correct ? "bg-mint/20 text-mint-foreground" : "bg-destructive/10 text-destructive"}`}
        >
          {correct
            ? `✅ ¡Correcto! ${explanation ?? ""}`
            : `❌ Casi… la respuesta es "${answer}". ${explanation ?? ""}`}
        </p>
      )}
    </div>
  );
}

function StoryStepsCard({
  title,
  steps,
  emoji,
}: {
  title: string;
  steps: string[];
  emoji: string;
}) {
  const [idx, setIdx] = useState(0);
  const last = idx >= steps.length - 1;
  return (
    <div className="rounded-2xl bg-card border-2 border-accent/30 p-3 my-2 animate-pop-in">
      <p className="font-bold text-sm mb-2">
        {emoji} {title}
      </p>
      <div className="bg-muted rounded-xl p-2.5 text-sm min-h-[3rem]">
        <span className="text-xs text-muted-foreground font-mono mr-1">
          {Math.min(idx + 1, Math.max(steps.length, 1))}/{Math.max(steps.length, 1)}
        </span>
        {steps[idx] ?? "Listo para empezar"}
      </div>
      <div className="mt-2 flex justify-between items-center">
        <div className="flex gap-1">
          {steps.map((_, i) => (
            <span
              key={i}
              className={`w-1.5 h-1.5 rounded-full ${i <= idx ? "bg-primary" : "bg-muted"}`}
            />
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
