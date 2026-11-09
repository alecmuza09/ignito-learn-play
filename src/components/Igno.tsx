import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Mic, Volume2, VolumeX } from "lucide-react";
import { logActivity, uiModeFor, updateProfile, useProfile } from "@/lib/profile";
import { useT } from "@/lib/i18n";
import { stripEmoji } from "@/lib/text";
import { ignoSpeak } from "@/lib/voice.functions";
import { useCompanionVoice, useSpeechInput } from "@/lib/voice";
import { Companion, type CompanionState } from "./companion/Companion";
import { CHARACTERS } from "./companion/characters";
import { onCompanionReaction, reactCompanion, type CompanionReaction } from "./companion/bus";
import { AnimatedSimulation, inferSimulationKind } from "./gen-ui/AnimatedSimulation";
import { SIMULATION_KINDS, type SimulationKind } from "@/lib/gen-blocks";

export function IgnoOwl({ size = 64 }: { size?: number; animate?: boolean }) {
  const profile = useProfile();
  return <Companion id={profile?.companion ?? "igno"} size={size} />;
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
  const entries = messages.flatMap<ChatEntry>((message) => {
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

const STATUS = {
  es: { idle: "Listo para aprender contigo", listening: "Te escucho…", thinking: "Pensando…", speaking: "Hablando", kidsSub: "Tu compañero de aprendizaje", adultSub: "Tu mentor de IA", placeholder: "¿Qué quieres aprender hoy?", send: "Enviar", mic: "Hablar", voiceOn: "Silenciar voz", voiceOff: "Activar voz", close: "Cerrar chat", open: (n: string) => `Hablar con ${n}`, drawing: (n: string) => `${n} está preparando una idea…`, greet: (n: string) => `Hola, ${n}. ¿Aprendemos algo hoy?`, hello: (n: string, c: string) => `¡Hola ${n}! Soy ${c}. Pregúntame lo que sea — te respondo con animaciones, quizzes y retos.`, helloAdult: (n: string, c: string) => `Hola ${n}, soy ${c}. Pregúntame cualquier tema y te lo explico con ejemplos y ejercicios.` },
  en: { idle: "Ready to learn with you", listening: "Listening…", thinking: "Thinking…", speaking: "Speaking", kidsSub: "Your learning buddy", adultSub: "Your AI mentor", placeholder: "What do you want to learn today?", send: "Send", mic: "Talk", voiceOn: "Mute voice", voiceOff: "Turn voice on", close: "Close chat", open: (n: string) => `Talk to ${n}`, drawing: (n: string) => `${n} is preparing an idea…`, greet: (n: string) => `Hi ${n}! Want to learn something fun?`, hello: (n: string, c: string) => `Hi ${n}! I'm ${c}. Ask me anything — I answer with animations, quizzes and challenges.`, helloAdult: (n: string, c: string) => `Hi ${n}, I'm ${c}. Ask me about any topic and I'll explain it with examples and exercises.` },
} as const;

export function IgnoFloating() {
  const profile = useProfile();
  const loc = useLocation();
  const t = useT(STATUS);
  const speakFn = useServerFn(ignoSpeak);
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [entries, setEntries] = useState<ChatEntry[]>([]);
  const [sending, setSending] = useState(false);
  const [reaction, setReaction] = useState<CompanionReaction | null>(null);
  const [peek, setPeek] = useState<string | null>(null);
  const [lastInteraction, setLastInteraction] = useState(() => Date.now());
  const [now, setNow] = useState(() => Date.now());
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const threadId = useMemo(() => makeId("thread"), []);

  const companionId = profile?.companion ?? "igno";
  const spec = CHARACTERS[companionId];
  const audience = uiModeFor(profile);
  const voiceOn = profile?.voiceEnabled ?? true;

  const fetchAudio = useCallback(
    async (text: string) => {
      const r = await speakFn({ data: { text, voice: spec.voice, audience, language: profile?.language ?? "es" } });
      return "audio" in r ? r : null;
    },
    [speakFn, spec.voice, audience, profile?.language],
  );
  const voice = useCompanionVoice(fetchAudio, profile?.language ?? "es");

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [entries, sending, open]);

  // Temporary reactions coming from quizzes, lessons, etc.
  useEffect(
    () =>
      onCompanionReaction((r) => {
        setReaction(r);
        setLastInteraction(Date.now());
        if (r.say) setPeek(r.say);
        setTimeout(() => {
          setReaction((cur) => (cur === r ? null : cur));
          setPeek((cur) => (cur === r.say ? null : cur));
        }, r.ms ?? 2200);
      }),
    [],
  );

  // Greets once per session, then dozes off when ignored for a while.
  useEffect(() => {
    if (!profile || typeof window === "undefined" || sessionStorage.getItem("ignoto.greeted")) return;
    const id = setTimeout(() => {
      sessionStorage.setItem("ignoto.greeted", "1");
      reactCompanion({ state: "happy", say: t.greet(profile.childName), ms: 4500 });
    }, 1800);
    return () => clearTimeout(id);
  }, [profile, t]);
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 15_000);
    return () => clearInterval(id);
  }, []);

  const speech = useSpeechInput(profile?.language ?? "es", (text) => void send(text));

  if (!profile || loc.pathname.startsWith("/admin") || loc.pathname.startsWith("/auth")) return null;

  const state: CompanionState = speech.listening
    ? "listening"
    : sending
      ? "thinking"
      : voice.speaking
        ? "speaking"
        : reaction
          ? reaction.state
          : input.trim()
            ? "listening"
            : !open && now - lastInteraction > 90_000
              ? "sleepy"
              : "idle";

  async function send(raw: string) {
    const p = profile;
    const text = raw.trim();
    if (!text || sending || !p) return;
    voice.stop();
    setLastInteraction(Date.now());

    const userEntry: ChatEntry = { id: makeId("user"), role: "user", text };
    const pendingEntry: ChatEntry = { id: makeId("pending"), role: "assistant", pending: true };
    setInput("");
    setSending(true);
    setEntries((current) => [...current, userEntry, pendingEntry]);
    void logActivity("chat", { chars: text.length });

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
                  description: audience === "adult" ? "Perfil del adulto que está aprendiendo" : "Perfil del niño que está usando IGNO",
                  value: JSON.stringify({
                    name: p.childName,
                    age: p.age,
                    audience,
                    interests: p.interests,
                    language: p.language,
                  }),
                },
                {
                  description: "Personaje",
                  value: `Te llamas ${spec.name} (${spec.tagline.es}). Habla en primera persona con esa personalidad.`,
                },
                {
                  description: "Reglas visuales de IGNO",
                  value: `Cada respuesta debe crear contenido muy dinámico: una animación SVG, quiz, reto o pasos directamente relacionados con la pregunta. Conecta el tema con estos gustos: ${p.interests.join(", ") || "intereses generales"}. Evita visuales genéricos.`,
                },
              ],
            },
          },
        }),
      });

      if (!response.ok) throw new Error(`${spec.name} no pudo responder ahora.`);
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
      const said = assistantEntries.map((e) => e.text).filter(Boolean).join(" ");
      if (voiceOn && said) void voice.speak(said);
      else reactCompanion({ state: "happy", ms: 1200 });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : `${spec.name} se quedó pensando. Inténtalo otra vez.`;
      reactCompanion({ state: "sad", ms: 1800 });
      setEntries((current) =>
        current
          .filter((entry) => entry.id !== pendingEntry.id)
          .concat({
            id: makeId("error"),
            role: "assistant",
            text: message,
          }),
      );
    } finally {
      setSending(false);
    }
  }

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void send(input);
  };

  const status =
    state === "listening" ? t.listening : state === "thinking" ? t.thinking : state === "speaking" ? t.speaking : t.idle;

  return (
    <>
      {!open && (
        <div className="fixed bottom-4 right-4 z-50 flex items-end gap-2">
          {peek && (
            <div className="mb-10 max-w-[220px] rounded-2xl rounded-br-sm bg-card sticker-sm px-3 py-2 text-sm font-semibold animate-pop-in">
              {peek}
            </div>
          )}
          <button
            onClick={() => {
              setOpen(true);
              setPeek(null);
              setLastInteraction(Date.now());
            }}
            className="companion-launcher rounded-full p-1 transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-4 ring-primary/40"
            aria-label={t.open(spec.name)}
          >
            <Companion id={companionId} size={68} state={state} interactive={false} />
          </button>
        </div>
      )}
      {open && (
        <div className="fixed bottom-4 right-4 z-50 w-[min(430px,calc(100vw-2rem))] h-[min(680px,calc(100vh-6rem))] bg-card rounded-3xl sticker overflow-hidden animate-pop-in flex flex-col">
          <div className="companion-stage relative flex items-center gap-3 px-4 pt-3 pb-2 flex-shrink-0">
            <Companion id={companionId} size={76} state={state} getLevel={voice.getLevel} label={spec.name} />
            <div className="flex-1 min-w-0">
              <h3 className="font-display text-2xl leading-tight">{spec.name}</h3>
              <p className="text-xs text-muted-foreground">{audience === "adult" ? t.adultSub : t.kidsSub}</p>
              <p className="mt-1 inline-flex items-center gap-1.5 rounded-full border-2 border-ink bg-card px-2 py-0.5 text-[11px] font-bold">
                <span className={`h-2 w-2 rounded-full ${state === "idle" ? "bg-mint" : "bg-primary animate-pulse"}`} />
                {status}
              </p>
            </div>
            <div className="flex flex-col gap-1 self-start">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="h-9 w-9 rounded-full border-2 border-ink bg-card text-xl leading-none hover:bg-lime"
                aria-label={t.close}
              >
                ×
              </button>
              <button
                type="button"
                onClick={() => {
                  if (voiceOn) voice.stop();
                  updateProfile({ voiceEnabled: !voiceOn });
                }}
                className="h-9 w-9 rounded-full border-2 border-ink bg-card hover:bg-lime"
                aria-label={voiceOn ? t.voiceOn : t.voiceOff}
                aria-pressed={voiceOn}
              >
                {voiceOn ? <Volume2 className="mx-auto h-4 w-4" /> : <VolumeX className="mx-auto h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-3 paper-grid border-y-2 border-ink">
            {entries.length === 0 && (
              <div className="rounded-2xl bg-card border-2 border-ink p-3 text-sm leading-relaxed animate-pop-in">
                {audience === "adult" ? t.helloAdult(profile.childName, spec.name) : t.hello(profile.childName, spec.name)}
              </div>
            )}
            {entries.map((entry) => (
              <ChatBubble key={entry.id} entry={entry} pendingText={t.drawing(spec.name)} />
            ))}
            {speech.listening && speech.interim && (
              <div className="flex justify-end">
                <div className="max-w-[86%] rounded-2xl px-3 py-2 text-sm bg-primary/70 text-primary-foreground italic border-2 border-ink border-dashed">{speech.interim}</div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <form onSubmit={onSubmit} className="flex gap-2 bg-card p-3">
            {speech.supported && (
              <button
                type="button"
                onClick={() => (speech.listening ? speech.stop() : (voice.stop(), speech.start()))}
                disabled={sending}
                className={`grid h-10 w-10 flex-shrink-0 place-items-center rounded-2xl transition-colors border-2 border-ink ${speech.listening ? "bg-coral animate-pulse" : "bg-card hover:bg-lime"}`}
                aria-label={t.mic}
                aria-pressed={speech.listening}
              >
                <Mic className="h-4 w-4" />
              </button>
            )}
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              className="field !min-h-10 min-w-0 flex-1 !py-2 text-sm"
              placeholder={t.placeholder}
              disabled={sending}
            />
            <button
              type="submit"
              disabled={sending || !input.trim()}
              className="btn-sticker bg-primary text-primary-foreground px-4 text-sm"
            >
              {sending ? "…" : t.send}
            </button>
          </form>
        </div>
      )}
    </>
  );
}

function ChatBubble({ entry, pendingText }: { entry: ChatEntry; pendingText: string }) {
  if (entry.pending) {
    return (
      <div className="max-w-[86%] rounded-2xl bg-card border-2 border-ink px-3 py-2 text-sm animate-pulse">
        {pendingText}
      </div>
    );
  }

  if (entry.tool) return <ToolRenderer tool={entry.tool} />;

  const mine = entry.role === "user";
  return (
    <div className={`flex ${mine ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[86%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${mine ? "bg-primary text-primary-foreground border-2 border-ink" : "bg-card border-2 border-ink"}`}
      >
        {mine ? entry.text : stripEmoji(entry.text ?? "")}
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
    <div className="rounded-2xl bg-card sticker-sm p-3 my-2 animate-pop-in">
      <p className="font-bold text-sm mb-2">{question}</p>
      <div className="grid gap-1.5">
        {options.map((opt, i) => {
          const isPicked = picked === i;
          const isCorrect = i === answerIndex;
          const showState = picked !== null;
          let cls = "text-left text-sm rounded-xl px-3 py-2 border-2 transition ";
          if (!showState)
            cls += "border-ink bg-card hover:bg-lime";
          else if (isCorrect) cls += "border-ink bg-mint font-semibold";
          else if (isPicked) cls += "border-destructive bg-destructive/10 text-destructive";
          else cls += "border-ink/30 bg-card opacity-60";
          return (
            <button
              key={i}
              disabled={picked !== null}
              onClick={() => {
                setPicked(i);
                reactCompanion(i === answerIndex ? { state: "celebrate", say: "¡Bien hecho!" } : { state: "sad", say: "Casi. Mira la explicación." });
              }}
              className={cls}
            >
              {showState && (isCorrect ? "Correcta: " : isPicked ? "Tu respuesta: " : "")}
              {opt}
            </button>
          );
        })}
      </div>
      {picked !== null && explanation && (
        <p className="mt-2 text-xs bg-lime/50 border-2 border-ink rounded-lg px-2 py-1.5">
          {explanation}
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
    <div className="rounded-2xl bg-card sticker-sm p-3 my-2 animate-pop-in">
      <p className="font-bold text-sm mb-2">{question}</p>
      {hint && <p className="text-xs text-muted-foreground mb-1.5">Pista: {hint}</p>}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setSubmitted(true);
          reactCompanion(norm(val) === norm(answer) ? { state: "celebrate", say: "¡Correcto!" } : { state: "surprised", say: "Casi. Revisa la respuesta." });
        }}
        className="flex gap-1.5"
      >
        <input
          value={val}
          onChange={(e) => {
            setVal(e.target.value);
            setSubmitted(false);
          }}
          className="field !min-h-10 !py-1.5 text-sm"
          placeholder="Tu respuesta…"
        />
        <button
          type="submit"
          className="btn-sticker bg-primary text-primary-foreground px-3 text-sm"
        >
          Revisar
        </button>
      </form>
      {submitted && (
        <p
          className={`mt-2 text-xs rounded-lg border-2 px-2 py-1.5 ${correct ? "border-ink bg-mint" : "border-destructive bg-destructive/10 text-destructive"}`}
        >
          {correct
            ? `¡Correcto! ${explanation ?? ""}`
            : `Casi. La respuesta es "${answer}". ${explanation ?? ""}`}
        </p>
      )}
    </div>
  );
}

function StoryStepsCard({
  title,
  steps,
}: {
  title: string;
  steps: string[];
}) {
  const [idx, setIdx] = useState(0);
  const last = idx >= steps.length - 1;
  return (
    <div className="rounded-2xl bg-card sticker-sm p-3 my-2 animate-pop-in">
      <p className="font-bold text-sm mb-2">{title}</p>
      <div className="paper-lines border-2 border-ink rounded-xl p-2.5 pl-12 text-sm min-h-[3rem]">
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
              className={`w-2 h-2 rounded-full border border-ink ${i <= idx ? "bg-primary" : "bg-card"}`}
            />
          ))}
        </div>
        <button
          onClick={() => setIdx((i) => Math.min(i + 1, steps.length - 1))}
          disabled={last}
          className="btn-sticker bg-primary text-primary-foreground text-xs px-3 py-1"
        >
          {last ? "Listo" : "Siguiente"}
        </button>
      </div>
    </div>
  );
}
