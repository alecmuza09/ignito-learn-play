import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { askIgno, generateHeroImage, type IgnoBlock } from "@/lib/ai.functions";
import { useProfile } from "@/lib/profile";
import { KawaiiBlob } from "./KawaiiBlob";
import { AnimatedSimulation, AnimatedVisualFallback } from "./gen-ui/AnimatedSimulation";

export function IgnoOwl({ size = 64, animate = true }: { size?: number; animate?: boolean }) {
  return (
    <div className={animate ? "animate-float" : ""}>
      <KawaiiBlob size={size} shape="blob" color="var(--primary)" mood="happy" />
    </div>
  );
}

interface ChatMsg {
  role: "you" | "igno";
  text?: string;
  blocks?: (IgnoBlock & { _imgUrl?: string })[];
}

export function IgnoFloating() {
  const profile = useProfile();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [loading, setLoading] = useState(false);
  const ask = useServerFn(askIgno);
  const genImg = useServerFn(generateHeroImage);

  if (!profile) return null;

  async function send() {
    if (!q.trim() || !profile) return;
    const question = q.trim();
    setQ("");
    setMessages((m) => [...m, { role: "you", text: question }]);
    setLoading(true);
    try {
      const res = await ask({ data: {
        question,
        childName: profile.childName,
        age: profile.age,
        interests: profile.interests,
        language: profile.language,
      }});
      const blocks = res.blocks.map((b) => ({ ...b }));
      setMessages((m) => [...m, { role: "igno", blocks }]);
      // AI images can be slow, so only enrich the first image block; SVG simulations render instantly.
      blocks.map((b, bi) => ({ b, bi })).filter(({ b }) => b.type === "image" && b.imagePrompt).slice(0, 1).forEach(({ b, bi }) => {
        if (b.type === "image" && b.imagePrompt) {
          genImg({ data: { prompt: b.imagePrompt, interests: profile!.interests } })
            .then((r) => {
              if (!r.url) return;
              setMessages((m) => m.map((msg) => {
                if (msg.role !== "igno" || msg.blocks !== blocks) return msg;
                const nb = msg.blocks.map((x, i) => i === bi ? { ...x, _imgUrl: r.url } : x);
                return { ...msg, blocks: nb };
              }));
            })
            .catch(() => {});
        }
      });
    } catch (e) {
      setMessages((m) => [...m, { role: "igno", text: e instanceof Error ? e.message : "Algo pasó. ¡Intenta otra vez!" }]);
    } finally { setLoading(false); }
  }

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
        <div className="fixed bottom-28 right-5 z-50 w-[min(400px,calc(100vw-2rem))] bg-card rounded-3xl shadow-soft border-2 border-primary/20 overflow-hidden animate-pop-in">
          <div className="bg-primary p-4 text-primary-foreground flex items-center gap-3">
            <div className="bg-primary-foreground/15 rounded-full p-1">
              <KawaiiBlob size={36} shape="blob" color="var(--primary-foreground)" mood="wink" />
            </div>
            <div>
              <h3 className="font-display font-bold">IGNO</h3>
              <p className="text-xs opacity-90">Tu tutor con superpoderes</p>
            </div>
            <button onClick={() => setOpen(false)} className="ml-auto text-2xl leading-none opacity-80 hover:opacity-100">×</button>
          </div>
          <div className="p-4 max-h-[28rem] overflow-y-auto space-y-3 bg-muted/40">
            {messages.length === 0 && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">¡Hola {profile.childName}! Pregúntame lo que sea — te respondo con ejemplos, imágenes y tips ✨</p>
                <div className="flex flex-wrap gap-1.5">
                  {["¿Qué son las fracciones?", "Explícame los planetas", "Dame un truco de memoria"].map((s) => (
                    <button key={s} onClick={() => setQ(s)} className="text-xs rounded-full bg-card border border-border px-2.5 py-1 hover:bg-primary hover:text-primary-foreground transition">
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {messages.map((m, i) => (
              m.role === "you" ? (
                <div key={i} className="max-w-[85%] ml-auto rounded-2xl px-3 py-2 text-sm bg-primary text-primary-foreground animate-pop-in">
                  {m.text}
                </div>
              ) : (
                <IgnoMessage key={i} text={m.text} blocks={m.blocks} />
              )
            ))}
            {loading && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="inline-block w-2 h-2 rounded-full bg-primary animate-bounce" />
                <span className="inline-block w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0.15s" }} />
                <span className="inline-block w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0.3s" }} />
                <span>IGNO está dibujando ideas…</span>
              </div>
            )}
          </div>
          <form onSubmit={(e) => { e.preventDefault(); send(); }} className="p-3 flex gap-2 bg-card border-t border-border">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="¿Qué quieres saber?"
              className="flex-1 rounded-full bg-muted px-4 py-2 text-sm outline-none focus:ring-2 ring-primary"
            />
            <button disabled={loading || !q.trim()} className="rounded-full bg-primary text-primary-foreground px-4 py-2 text-sm font-bold disabled:opacity-50">→</button>
          </form>
        </div>
      )}
    </>
  );
}

function IgnoMessage({ text, blocks }: { text?: string; blocks?: (IgnoBlock & { _imgUrl?: string })[] }) {
  if (!blocks?.length) {
    return (
      <div className="max-w-[92%] rounded-2xl px-3 py-2 text-sm bg-card border border-border animate-pop-in">
        {text}
      </div>
    );
  }
  return (
    <div className="max-w-[92%] space-y-2 animate-pop-in">
      {blocks.map((b, i) => {
        if (b.type === "text") {
          return (
            <div key={i} className="rounded-2xl px-3 py-2 text-sm bg-card border border-border" dangerouslySetInnerHTML={{ __html: renderInline(b.text ?? "") }} />
          );
        }
        if (b.type === "image") {
          return (
            <div key={i} className="rounded-2xl overflow-hidden border border-border bg-card">
              {b._imgUrl ? (
                <img src={b._imgUrl} alt={b.caption ?? ""} className="w-full aspect-[4/3] object-cover" />
              ) : (
                <AnimatedVisualFallback prompt={b.imagePrompt} title={b.caption ?? "Visual generativo"} compact />
              )}
              {b.caption && <div className="p-2 text-xs text-muted-foreground">{b.caption}</div>}
            </div>
          );
        }
        if (b.type === "simulation") {
          return <AnimatedSimulation key={i} kind={b.kind} title={b.title} caption={b.caption} steps={b.steps} compact hint={`${b.title ?? ""} ${b.caption ?? ""} ${(b.steps ?? []).join(" ")}`} />;
        }
        if (b.type === "example") {
          return (
            <div key={i} className="rounded-2xl px-3 py-2.5 bg-mint/20 border border-mint/40">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-mint-foreground/80">
                <span className="text-base leading-none">{b.icon ?? "🌟"}</span>
                <span>{b.title ?? "Ejemplo"}</span>
              </div>
              <p className="mt-1 text-sm">{b.body}</p>
            </div>
          );
        }
        if (b.type === "tip") {
          return (
            <div key={i} className="rounded-2xl px-3 py-2 bg-accent/20 border border-accent/40 text-sm flex gap-2">
              <span className="text-base leading-none">{b.icon ?? "💡"}</span>
              <span>{b.text}</span>
            </div>
          );
        }
        return null;
      })}
    </div>
  );
}

/** Tiny inline renderer: **bold** -> <strong>. Escapes HTML first. */
function renderInline(s: string): string {
  const esc = s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
  return esc.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
}
