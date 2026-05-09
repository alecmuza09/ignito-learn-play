import { useMemo, useState } from "react";
import type { GenBlock, MiniQuizBlock, TryItBlock } from "@/lib/gen-blocks";
import { toneClasses } from "@/lib/theme-from-interests";
import { useGenTheme } from "./primitives";
import { KawaiiBlob } from "./KawaiiBlob";
import { AnimatedSimulation, AnimatedVisualFallback } from "./AnimatedSimulation";

export interface GenRendererProps {
  blocks: GenBlock[];
  imageUrls: Record<string, string>;
  onMiniQuizAnswer?: (block: MiniQuizBlock, picked: number, correct: boolean) => void;
  onTryItDone?: (block: TryItBlock, correct: boolean) => void;
}

export function GenRenderer({ blocks, imageUrls, onMiniQuizAnswer, onTryItDone }: GenRendererProps) {
  return (
    <div className="space-y-5">
      {blocks.map((b) => (
        <BlockShell key={b.id} agentInserted={b.agentInserted}>
          <RenderOne b={b} imageUrls={imageUrls} onMiniQuizAnswer={onMiniQuizAnswer} onTryItDone={onTryItDone} />
        </BlockShell>
      ))}
    </div>
  );
}

function BlockShell({ children, agentInserted }: { children: React.ReactNode; agentInserted?: boolean }) {
  if (!agentInserted) return <div className="animate-pop-in">{children}</div>;
  return (
    <div className="relative animate-pop-in">
      <div className="absolute -top-2 left-3 z-10 text-[10px] font-bold uppercase tracking-wider rounded-full bg-accent text-accent-foreground px-2 py-0.5 shadow-pop">
        🤖 IA en vivo
      </div>
      <div className="ring-2 ring-accent/60 rounded-3xl">{children}</div>
    </div>
  );
}

function RenderOne({ b, imageUrls, onMiniQuizAnswer, onTryItDone }: {
  b: GenBlock; imageUrls: Record<string, string>;
  onMiniQuizAnswer?: (block: MiniQuizBlock, picked: number, correct: boolean) => void;
  onTryItDone?: (block: TryItBlock, correct: boolean) => void;
}) {
  switch (b.type) {
    case "hero":       return <HeroBlock b={b} url={imageUrls[b.id]} />;
    case "text":       return <TextBlock b={b} />;
    case "image":      return <ImageBlock b={b} url={imageUrls[b.id]} />;
    case "compare":    return <CompareBlock b={b} urls={imageUrls} />;
    case "steps":      return <StepsBlock b={b} />;
    case "callout":    return <CalloutBlock b={b} />;
    case "mascotSays": return <MascotSaysBlock b={b} />;
    case "tryIt":      return <TryItBlockView b={b} onDone={onTryItDone} />;
    case "miniQuiz":   return <MiniQuizBlockView b={b} onAnswer={onMiniQuizAnswer} />;
    case "celebrate":  return <CelebrateBlock b={b} />;
    case "simulation": return <SimulationBlockView b={b} />;
  }
}

/* ---------- individual block components ---------- */

function HeroBlock({ b, url }: { b: Extract<GenBlock,{type:"hero"}>; url?: string }) {
  const theme = useGenTheme();
  const t = toneClasses(b.tone ?? theme.tone);
  return (
    <div className={`rounded-3xl overflow-hidden ${t.bg} ${t.text} shadow-soft`}>
      {url ? (
        <div className="relative aspect-[16/9] w-full">
          <img src={url} alt={b.title} className="absolute inset-0 w-full h-full object-cover" />
          <div className={`absolute inset-x-0 bottom-0 h-2/3 ${t.bg} opacity-70`} />
          <div className="absolute bottom-0 left-0 right-0 p-5">
            <div className="text-[10px] font-bold uppercase opacity-90 tracking-wider">Misión</div>
            <h1 className="font-display text-2xl md:text-3xl font-bold leading-tight">{b.title}</h1>
            {b.subtitle && <p className="mt-1 opacity-90 text-sm">{b.subtitle}</p>}
          </div>
        </div>
      ) : (
        <div className="p-6">
          <div className="text-xs font-bold uppercase opacity-90 tracking-wider">Misión</div>
          <h1 className="font-display text-3xl font-bold mt-1">{b.title}</h1>
          {b.subtitle && <p className="mt-2 opacity-90 text-sm">{b.subtitle}</p>}
          <div className="mt-3 flex items-center gap-2 text-xs opacity-90">
            <span className="inline-block w-3 h-3 rounded-full bg-accent animate-pulse" />
            IGNO está pintando la portada…
          </div>
        </div>
      )}
    </div>
  );
}

function TextBlock({ b }: { b: Extract<GenBlock,{type:"text"}> }) {
  const isFact = b.emphasis === "fact";
  const isAnal = b.emphasis === "analogy";
  if (isFact) return (
    <div className="rounded-3xl bg-coral text-coral-foreground p-5 shadow-soft">
      <div className="text-xs font-bold uppercase opacity-90 mb-1">💡 Dato curioso</div>
      <p className="leading-relaxed">{b.body}</p>
    </div>
  );
  if (isAnal) return (
    <div className="rounded-3xl bg-mint text-mint-foreground p-5 shadow-soft">
      <div className="text-xs font-bold uppercase opacity-90 mb-1">🔗 Analogía</div>
      <p className="leading-relaxed">{b.body}</p>
    </div>
  );
  return (
    <div className="rounded-3xl bg-card border border-border p-5">
      <p className="leading-relaxed text-foreground/90">{b.body}</p>
    </div>
  );
}

function ImageBlock({ b, url }: { b: Extract<GenBlock,{type:"image"}>; url?: string }) {
  const ratio = b.ratio === "1:1" ? "aspect-square" : b.ratio === "4:3" ? "aspect-[4/3]" : "aspect-[16/9]";
  return (
    <figure className="rounded-3xl overflow-hidden bg-card border border-border">
      {url ? (
        <img src={url} alt={b.caption ?? ""} className={`w-full ${ratio} object-cover`} />
      ) : (
        <div className={ratio}>
          <AnimatedVisualFallback prompt={b.imagePrompt} title={b.caption ?? "Visual generativo"} compact />
        </div>
      )}
      {b.caption && <figcaption className="px-4 py-2 text-xs text-muted-foreground">{b.caption}</figcaption>}
    </figure>
  );
}

function CompareBlock({ b, urls }: { b: Extract<GenBlock,{type:"compare"}>; urls: Record<string,string> }) {
  const lUrl = urls[b.id + ":left"];
  const rUrl = urls[b.id + ":right"];
  return (
    <div className="rounded-3xl bg-card border border-border p-4 space-y-3">
      <div className="grid grid-cols-2 gap-3">
        {[["L", b.left, lUrl], ["R", b.right, rUrl]].map(([k, side, u]) => {
          const s = side as { label: string; imagePrompt: string };
          return (
            <div key={k as string} className="rounded-2xl overflow-hidden bg-muted">
              {u ? (
                <img src={u as string} alt={s.label} className="w-full aspect-square object-cover" />
              ) : (
                <div className="aspect-square overflow-hidden">
                  <AnimatedVisualFallback prompt={s.imagePrompt} title={s.label} compact />
                </div>
              )}
              <div className="px-3 py-2 text-sm font-bold text-center">{s.label}</div>
            </div>
          );
        })}
      </div>
      {b.takeaway && (
        <div className="rounded-2xl bg-accent/15 border border-accent/30 px-3 py-2 text-sm">
          <span className="font-bold">→ </span>{b.takeaway}
        </div>
      )}
    </div>
  );
}

function StepsBlock({ b }: { b: Extract<GenBlock,{type:"steps"}> }) {
  const theme = useGenTheme();
  const t = toneClasses(theme.tone);
  return (
    <div className="rounded-3xl bg-card border border-border p-5">
      {b.title && <h3 className="font-display text-lg font-bold mb-3">{b.title}</h3>}
      <ol className="space-y-3">
        {b.items.map((it, i) => (
          <li key={i} className="flex gap-3 items-start">
            <span className={`shrink-0 w-9 h-9 rounded-2xl ${t.bgSoft} ${t.border} border-2 grid place-items-center text-base font-bold`}>
              {it.icon ?? i + 1}
            </span>
            <div className="flex-1">
              <div className="font-bold text-sm">{it.label}</div>
              {it.body && <div className="text-sm text-foreground/80 mt-0.5 leading-relaxed">{it.body}</div>}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

function CalloutBlock({ b }: { b: Extract<GenBlock,{type:"callout"}> }) {
  const theme = useGenTheme();
  const t = toneClasses(b.tone ?? theme.accentTone);
  return (
    <div className={`rounded-3xl ${t.bgSoft} border-2 ${t.border}/40 p-4 flex gap-3`}>
      <div className={`shrink-0 w-12 h-12 rounded-2xl ${t.bg} ${t.text} grid place-items-center text-2xl shadow-pop`}>
        {b.icon ?? "📣"}
      </div>
      <div>
        <div className="font-display font-bold leading-tight">{b.title}</div>
        <p className="text-sm text-foreground/85 mt-1 leading-relaxed">{b.body}</p>
      </div>
    </div>
  );
}

function MascotSaysBlock({ b }: { b: Extract<GenBlock,{type:"mascotSays"}> }) {
  const theme = useGenTheme();
  const t = toneClasses(theme.tone);
  const mood = (b.mood ?? "happy") as "happy"|"wink"|"wow"|"calm";
  return (
    <div className="flex items-end gap-3">
      <div className="animate-float shrink-0"><KawaiiBlob size={64} mood={mood} /></div>
      <div className={`relative ${t.bg} ${t.text} rounded-2xl rounded-bl-sm px-4 py-3 font-semibold shadow-pop`}>
        {b.text}
      </div>
    </div>
  );
}

function CelebrateBlock({ b }: { b: Extract<GenBlock,{type:"celebrate"}> }) {
  const theme = useGenTheme();
  const t = toneClasses(theme.accentTone);
  const parts = b.particles ?? theme.particles;
  return (
    <div className={`relative overflow-hidden rounded-3xl ${t.bg} ${t.text} px-5 py-4 shadow-pop text-center`}>
      <div aria-hidden className="absolute inset-0 pointer-events-none">
        {parts.concat(parts).map((c, i) => (
          <span key={i} className="absolute text-2xl opacity-70"
            style={{ top: `${(i*23)%80}%`, left: `${(i*37+5)%90}%`,
              animation: `gen-banner-float ${3+(i%3)}s ease-in-out ${i*0.15}s infinite alternate` }}>{c}</span>
        ))}
      </div>
      <div className="relative font-display text-xl font-bold">{b.message}</div>
    </div>
  );
}

function MiniQuizBlockView({ b, onAnswer }: { b: MiniQuizBlock; onAnswer?: (b: MiniQuizBlock, picked: number, correct: boolean) => void }) {
  const [picked, setPicked] = useState<number | null>(null);
  const theme = useGenTheme();
  return (
    <div className="rounded-3xl bg-card border-2 border-primary/30 p-5 space-y-3">
      <div className="text-xs font-bold uppercase tracking-wider text-primary">⚡ Mini-pregunta</div>
      <div className="font-display text-lg font-bold">{b.question}</div>
      <div className="space-y-2">
        {b.options.map((o, i) => {
          const isAns = i === b.answerIndex;
          const isPick = picked === i;
          const cls =
            picked === null ? "border-border hover:border-primary hover:bg-primary/5"
            : isAns ? "border-mint bg-mint/25"
            : isPick ? "border-destructive bg-destructive/15"
            : "border-border opacity-50";
          return (
            <button key={i} disabled={picked !== null}
              onClick={() => { setPicked(i); onAnswer?.(b, i, isAns); }}
              className={`w-full text-left rounded-2xl border-2 p-3 text-sm font-semibold transition ${cls}`}>
              <span className="inline-block w-6 h-6 rounded-lg bg-muted text-foreground text-xs grid place-items-center mr-2 align-middle">
                {String.fromCharCode(65+i)}
              </span>
              {o}
            </button>
          );
        })}
      </div>
      {picked !== null && b.explanation && (
        <div className={`rounded-2xl text-sm p-3 ${picked === b.answerIndex ? "bg-mint/20" : "bg-accent/15"}`}>
          {b.explanation}
        </div>
      )}
      {/* tone unused but theme available for future style hooks */}
      <span className="hidden">{theme.id}</span>
    </div>
  );
}

function TryItBlockView({ b, onDone }: { b: TryItBlock; onDone?: (b: TryItBlock, correct: boolean) => void }) {
  return (
    <div className="rounded-3xl bg-card border-2 border-sky/40 p-5 space-y-3">
      <div className="text-xs font-bold uppercase tracking-wider text-sky-foreground/80">🎯 Pruébalo</div>
      <div className="font-display text-base font-bold">{b.question}</div>
      {b.payload.kind === "tap"   && <TapInteraction b={b} payload={b.payload} onDone={onDone} />}
      {b.payload.kind === "sort"  && <SortInteraction b={b} payload={b.payload} onDone={onDone} />}
      {b.payload.kind === "input" && <InputInteraction b={b} payload={b.payload} onDone={onDone} />}
    </div>
  );
}

function TapInteraction({ b, payload, onDone }: {
  b: TryItBlock;
  payload: Extract<TryItBlock["payload"],{kind:"tap"}>;
  onDone?: (b: TryItBlock, correct: boolean) => void;
}) {
  const [picked, setPicked] = useState<number | null>(null);
  return (
    <>
      <div className="grid grid-cols-2 gap-2">
        {payload.options.map((o, i) => {
          const cls =
            picked === null ? "bg-muted hover:bg-sky/15 border-border"
            : i === payload.answerIndex ? "bg-mint/30 border-mint"
            : i === picked ? "bg-destructive/15 border-destructive"
            : "bg-muted/50 border-border opacity-50";
          return (
            <button key={i} disabled={picked !== null}
              onClick={() => { setPicked(i); onDone?.(b, i === payload.answerIndex); }}
              className={`rounded-2xl border-2 p-3 text-sm font-semibold transition ${cls}`}>
              {o}
            </button>
          );
        })}
      </div>
      {picked !== null && payload.explanation && (
        <div className="text-sm text-foreground/80 mt-1">{payload.explanation}</div>
      )}
    </>
  );
}

function SortInteraction({ b, payload, onDone }: {
  b: TryItBlock;
  payload: Extract<TryItBlock["payload"],{kind:"sort"}>;
  onDone?: (b: TryItBlock, correct: boolean) => void;
}) {
  const target = payload.items;
  const initial = useMemo(() => {
    // Fisher-Yates shuffle, deterministic per block id so SSR/CSR match
    const seed = b.id.split("").reduce((a,c)=>a+c.charCodeAt(0),0);
    const arr = [...target];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = (seed * (i+1)) % (i+1);
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }, [b.id, target]);
  const [order, setOrder] = useState<string[]>(initial);
  const [done, setDone] = useState(false);
  const correct = JSON.stringify(order) === JSON.stringify(target);
  function move(idx: number, dir: -1 | 1) {
    if (done) return;
    const j = idx + dir;
    if (j < 0 || j >= order.length) return;
    const next = [...order];
    [next[idx], next[j]] = [next[j], next[idx]];
    setOrder(next);
  }
  return (
    <>
      <ol className="space-y-2">
        {order.map((it, i) => (
          <li key={it} className="flex items-center gap-2 rounded-2xl bg-muted px-3 py-2 text-sm font-semibold">
            <span className="w-6 h-6 grid place-items-center rounded-lg bg-card text-xs">{i+1}</span>
            <span className="flex-1">{it}</span>
            <button disabled={done} onClick={() => move(i,-1)} className="px-2 py-0.5 rounded bg-card border border-border text-xs disabled:opacity-30">↑</button>
            <button disabled={done} onClick={() => move(i, 1)} className="px-2 py-0.5 rounded bg-card border border-border text-xs disabled:opacity-30">↓</button>
          </li>
        ))}
      </ol>
      <button disabled={done}
        onClick={() => { setDone(true); onDone?.(b, correct); }}
        className="rounded-full bg-sky text-sky-foreground font-bold px-4 py-2 text-sm disabled:opacity-50">
        Comprobar
      </button>
      {done && (
        <div className={`text-sm rounded-2xl p-3 ${correct ? "bg-mint/25" : "bg-accent/15"}`}>
          {correct ? "¡Orden perfecto! 🎉" : "Casi… el orden correcto era:"}
          {!correct && <div className="mt-1 text-xs">{target.join(" → ")}</div>}
          {payload.explanation && <div className="mt-1">{payload.explanation}</div>}
        </div>
      )}
    </>
  );
}

function InputInteraction({ b, payload, onDone }: {
  b: TryItBlock;
  payload: Extract<TryItBlock["payload"],{kind:"input"}>;
  onDone?: (b: TryItBlock, correct: boolean) => void;
}) {
  const [val, setVal] = useState("");
  const [done, setDone] = useState(false);
  const correct = val.trim().toLowerCase() === payload.answer.trim().toLowerCase();
  return (
    <>
      <div className="flex gap-2">
        <input value={val} onChange={(e)=>setVal(e.target.value)} disabled={done}
          placeholder={payload.hint ?? "Tu respuesta…"}
          className="flex-1 rounded-full bg-muted px-4 py-2 text-sm outline-none focus:ring-2 ring-sky" />
        <button disabled={done || !val.trim()}
          onClick={() => { setDone(true); onDone?.(b, correct); }}
          className="rounded-full bg-sky text-sky-foreground font-bold px-4 py-2 text-sm disabled:opacity-50">OK</button>
      </div>
      {done && (
        <div className={`text-sm rounded-2xl p-3 ${correct ? "bg-mint/25" : "bg-accent/15"}`}>
          {correct ? "¡Bien hecho! 🎉" : `Respuesta: ${payload.answer}`}
          {payload.explanation && <div className="mt-1">{payload.explanation}</div>}
        </div>
      )}
    </>
  );
}

/** Collect all (id, prompt) pairs of blocks that need an AI image. */
export function collectImageJobs(blocks: GenBlock[]): { key: string; prompt: string }[] {
  const out: { key: string; prompt: string }[] = [];
  for (const b of blocks) {
    if (b.type === "hero" || b.type === "image") out.push({ key: b.id, prompt: b.imagePrompt });
    if (b.type === "compare") {
      out.push({ key: b.id + ":left",  prompt: b.left.imagePrompt });
      out.push({ key: b.id + ":right", prompt: b.right.imagePrompt });
    }
  }
  return out;
}