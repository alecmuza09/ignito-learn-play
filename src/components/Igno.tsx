import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { askIgno } from "@/lib/ai.functions";
import { useProfile } from "@/lib/profile";

export function IgnoOwl({ size = 64, animate = true }: { size?: number; animate?: boolean }) {
  return (
    <div
      style={{ width: size, height: size }}
      className={`relative ${animate ? "animate-float" : ""}`}
      aria-label="IGNO el búho"
    >
      <svg viewBox="0 0 120 120" className="w-full h-full drop-shadow-lg">
        <ellipse cx="60" cy="92" rx="38" ry="10" fill="oklch(0.30 0.10 280 / 0.18)" />
        <path d="M60 18 C30 18 18 44 22 70 C26 96 50 108 60 108 C70 108 94 96 98 70 C102 44 90 18 60 18 Z" fill="var(--primary)" />
        <path d="M28 36 Q24 22 38 24 L40 38 Z" fill="var(--primary)" />
        <path d="M92 36 Q96 22 82 24 L80 38 Z" fill="var(--primary)" />
        <ellipse cx="60" cy="68" rx="32" ry="28" fill="var(--accent)" opacity="0.95" />
        <circle cx="46" cy="58" r="14" fill="white" />
        <circle cx="74" cy="58" r="14" fill="white" />
        <circle cx="46" cy="58" r="6" fill="oklch(0.22 0.05 280)" />
        <circle cx="74" cy="58" r="6" fill="oklch(0.22 0.05 280)" />
        <circle cx="48" cy="56" r="2" fill="white" />
        <circle cx="76" cy="56" r="2" fill="white" />
        <path d="M55 70 L60 76 L65 70 Z" fill="var(--coral)" />
        <path d="M30 78 Q22 82 26 92" stroke="var(--primary)" strokeWidth="6" fill="none" strokeLinecap="round" />
        <path d="M90 78 Q98 82 94 92" stroke="var(--primary)" strokeWidth="6" fill="none" strokeLinecap="round" />
      </svg>
    </div>
  );
}

export function IgnoFloating() {
  const profile = useProfile();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [messages, setMessages] = useState<{ role: "you" | "igno"; text: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const ask = useServerFn(askIgno);

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
      setMessages((m) => [...m, { role: "igno", text: res.reply }]);
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
        <IgnoOwl size={56} />
      </button>
      {open && (
        <div className="fixed bottom-28 right-5 z-50 w-[min(360px,calc(100vw-2rem))] bg-card rounded-3xl shadow-soft border-2 border-primary/20 overflow-hidden animate-pop-in">
          <div className="bg-gradient-hero p-4 text-primary-foreground flex items-center gap-3">
            <IgnoOwl size={40} animate={false} />
            <div>
              <h3 className="font-display font-bold">IGNO</h3>
              <p className="text-xs opacity-90">Tu tutor búho</p>
            </div>
            <button onClick={() => setOpen(false)} className="ml-auto text-2xl leading-none opacity-80 hover:opacity-100">×</button>
          </div>
          <div className="p-4 max-h-72 overflow-y-auto space-y-3 bg-muted/40">
            {messages.length === 0 && (
              <p className="text-sm text-muted-foreground">¡Hola {profile.childName}! Pregúntame lo que sea sobre tu lección 🦉</p>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm animate-pop-in ${m.role === "you" ? "ml-auto bg-primary text-primary-foreground" : "bg-card border border-border"}`}>
                {m.text}
              </div>
            ))}
            {loading && <div className="text-xs text-muted-foreground animate-pulse">IGNO está pensando…</div>}
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
