import { ReactNode, useEffect, useMemo, useState } from "react";
import { GenTheme, Tone, themeFromInterests, toneClasses } from "@/lib/theme-from-interests";
import { useProfile } from "@/lib/profile";

/** Hook: derive the live theme from the active child profile. */
export function useGenTheme(): GenTheme {
  const profile = useProfile();
  return useMemo(() => themeFromInterests(profile?.interests ?? []), [profile?.interests]);
}

/** Adaptive surface card. Tone defaults to the theme's secondary. */
export function GenCard({ children, tone, soft = true, className = "" }: {
  children: ReactNode; tone?: Tone; soft?: boolean; className?: string;
}) {
  const theme = useGenTheme();
  const t = toneClasses(tone ?? theme.accentTone);
  return (
    <div className={`rounded-3xl ${soft ? `${t.bgSoft} border-2 ${t.border}/30` : `${t.bg} ${t.text}`} p-5 shadow-soft ${className}`}>
      {children}
    </div>
  );
}

/** Adaptive CTA button — themed + motion-aware. */
export function GenButton({ children, onClick, tone, disabled, className = "", type = "button" }: {
  children: ReactNode; onClick?: () => void; tone?: Tone; disabled?: boolean;
  className?: string; type?: "button" | "submit";
}) {
  const theme = useGenTheme();
  const t = toneClasses(tone ?? theme.tone);
  const motion =
    theme.motion === "epic" ? "hover:-translate-y-0.5 active:translate-y-0.5"
    : theme.motion === "snappy" ? "active:scale-95"
    : theme.motion === "smooth" ? "hover:opacity-95"
    : "hover:-translate-y-0.5 active:scale-95";
  return (
    <button type={type} onClick={onClick} disabled={disabled}
      className={`rounded-full ${t.gradient} ${t.text} font-bold shadow-pop transition-all disabled:opacity-50 ${motion} ${className}`}>
      {children}
    </button>
  );
}

/** Floating motif backdrop — gentle, theme-aware. */
export function GenBackdrop() {
  const theme = useGenTheme();
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {theme.motifs.map((m, i) => (
        <span key={i} className="absolute text-3xl opacity-10 animate-float"
          style={{
            top: `${(i * 23 + 10) % 90}%`,
            left: `${(i * 41 + 8) % 92}%`,
            animationDelay: `${i * 0.7}s`,
            animationDuration: `${5 + (i % 3)}s`,
          }}>{m}</span>
      ))}
    </div>
  );
}

/** Particle burst overlay (correct answers, level ups). */
export function GenBurst({ items, count = 18 }: { items?: string[]; count?: number }) {
  const theme = useGenTheme();
  const pool = items ?? theme.particles;
  const parts = useMemo(
    () => Array.from({ length: count }, (_, i) => ({
      char: pool[i % pool.length],
      x: Math.random() * 100,
      y: 50 + Math.random() * 30,
      delay: Math.random() * 0.2,
      dur: 0.8 + Math.random() * 0.7,
      rot: (Math.random() - 0.5) * 720,
      scale: 0.8 + Math.random() * 0.9,
    })),
    [pool, count],
  );
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {parts.map((p, i) => (
        <span key={i} className="absolute text-2xl"
          style={{
            left: `${p.x}%`, top: `${p.y}%`,
            animation: `gen-burst ${p.dur}s ease-out ${p.delay}s forwards`,
            // CSS vars consumed by the keyframes below
            ["--rot" as string]: `${p.rot}deg`,
            ["--scale" as string]: `${p.scale}`,
          } as React.CSSProperties}>{p.char}</span>
      ))}
      <style>{`
        @keyframes gen-burst {
          0%   { transform: translateY(0) rotate(0) scale(0.4); opacity: 0; }
          15%  { opacity: 1; }
          100% { transform: translateY(-60vh) rotate(var(--rot)) scale(var(--scale)); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

/** Themed mascot bubble that the agent uses to talk to the kid. */
export function GenMascot({ message, tone, intensity = "normal" }: {
  message: string; tone?: Tone; intensity?: "calm" | "normal" | "epic";
}) {
  const theme = useGenTheme();
  const t = toneClasses(tone ?? theme.tone);
  const motion = intensity === "epic" ? "animate-bounce-slow" : intensity === "calm" ? "" : "animate-pop-in";
  return (
    <div className={`flex items-end gap-3 ${motion}`}>
      <div className="text-4xl">🦉</div>
      <div className={`relative ${t.bg} ${t.text} rounded-2xl rounded-bl-sm px-4 py-3 font-semibold shadow-pop max-w-xs`}>
        {message}
      </div>
    </div>
  );
}

/** AgentReaction: the structured shape the UI agent emits per event. */
export interface AgentReaction {
  kind: "celebrate" | "encourage" | "hint" | "level-up" | "ambient";
  tone: Tone;
  headline: string;
  message: string;
  particles: string[];
  intensity: "calm" | "normal" | "epic";
  ttlMs: number;
}

/** Full-screen reaction layer driven by the agent. */
export function GenReaction({ reaction, onDone }: { reaction: AgentReaction | null; onDone?: () => void }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (!reaction) return;
    setShow(true);
    const t = setTimeout(() => { setShow(false); onDone?.(); }, reaction.ttlMs);
    return () => clearTimeout(t);
  }, [reaction, onDone]);
  if (!reaction || !show) return null;
  const t = toneClasses(reaction.tone);
  return (
    <div className="fixed inset-0 z-40 pointer-events-none flex items-start justify-center pt-24 px-4">
      {(reaction.kind === "celebrate" || reaction.kind === "level-up") && (
        <GenBurst items={reaction.particles} count={reaction.intensity === "epic" ? 30 : 18} />
      )}
      <div className={`pointer-events-auto rounded-3xl ${t.gradient} ${t.text} px-6 py-4 shadow-soft animate-pop-in max-w-md text-center`}>
        <div className="font-display text-2xl font-bold">{reaction.headline}</div>
        <div className="text-sm opacity-90 mt-1">{reaction.message}</div>
      </div>
    </div>
  );
}