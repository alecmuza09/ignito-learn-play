import { ReactNode, useEffect, useMemo, useState } from "react";
import { GenTheme, Tone, themeFromInterests, toneClasses } from "@/lib/theme-from-interests";
import { useProfile } from "@/lib/profile";
import { Companion } from "@/components/companion/Companion";
import { GeoMascot } from "@/components/companion/Companion";
import type { GeoShape } from "@/components/companion/characters";
import { Link } from "@tanstack/react-router";
import { stripEmoji } from "@/lib/text";

/** Hook: derive the live theme from the active child profile.
 *  SSR-safe: returns the default theme until mounted on the client so
 *  hydration HTML matches. */
export function useGenTheme(): GenTheme {
  const profile = useProfile();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  return useMemo(
    () => (mounted ? themeFromInterests(profile?.interests ?? []) : themeFromInterests([])),
    [mounted, profile?.interests],
  );
}

/** Adaptive surface card. Tone defaults to the theme's secondary. */
export function GenCard({ children, tone, soft = true, className = "" }: {
  children: ReactNode; tone?: Tone; soft?: boolean; className?: string;
}) {
  const theme = useGenTheme();
  const t = toneClasses(tone ?? theme.accentTone);
  return (
    <div className={`rounded-3xl sticker ${soft ? "bg-card" : `${t.bg} ${t.text}`} p-5 ${className}`}>
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
  void motion;
  return (
    <button type={type} onClick={onClick} disabled={disabled}
      className={`btn-sticker ${t.gradient} ${t.text} disabled:opacity-50 ${className}`}>
      {children}
    </button>
  );
}

/** Kept for existing call sites; the paper texture of each page is the backdrop now. */
export function GenBackdrop() {
  return null;
}

const SHAPE_FOR_THEME: Record<string, GeoShape> = { spider: "square", auto: "square", dino: "triangle", game: "pentagon", robot: "pentagon" };

/** Loud, persistent banner: "Modo X activado, personalizado para Niño".
 *  Goal: the kid SEES that the platform is shaped to them. */
export function GenThemeBanner({ subtitle, compact = false }: { subtitle?: string; compact?: boolean }) {
  const theme = useGenTheme();
  const profile = useProfile();
  const t = toneClasses(theme.tone);
  return (
    <Link to="/perfil" className={`relative flex items-center gap-3 rounded-2xl bg-card sticker-sm ${compact ? "px-3 py-2" : "px-4 py-3"}`}>
      <span className={`shrink-0 grid place-items-center rounded-xl border-2 border-ink ${t.bgSoft} ${compact ? "w-9 h-9" : "w-11 h-11"}`}>
        <GeoMascot shape={SHAPE_FOR_THEME[theme.id] ?? "circle"} size={compact ? 30 : 36} />
      </span>
      <div className="flex-1 min-w-0">
        <div className="text-[11px] font-semibold text-muted-foreground">Lecciones con el tema</div>
        <div className={`font-display leading-tight truncate ${compact ? "text-base" : "text-lg"}`}>{theme.label}</div>
      </div>
      {!compact && (
        <span className="hidden sm:block text-xs text-muted-foreground text-right">
          {subtitle ?? `Ajustado a ${profile?.childName ?? "ti"} · cambiar`}
        </span>
      )}
    </Link>
  );
}

/** Adaptive quiz option: themed motif bullet, themed states, micro-burst on hover. */
export function GenQuizOption({ index, label, state, onPick, disabled }: {
  index: number; label: string;
  state: "idle" | "correct" | "wrong" | "muted" | "picked-correct" | "picked-wrong";
  onPick: () => void; disabled?: boolean;
}) {
  const cls =
    state === "correct" || state === "picked-correct" ? "border-mint bg-mint/25 ring-2 ring-mint/40"
    : state === "picked-wrong" ? "border-destructive bg-destructive/15"
    : state === "muted"        ? "border-border opacity-50"
    : state === "wrong"        ? "border-destructive/50"
    : "border-ink bg-card hover:bg-white hover:-translate-y-0.5";
  return (
    <button onClick={onPick} disabled={disabled}
      className={`group w-full text-left rounded-2xl border-2 p-4 font-semibold transition-all flex items-center gap-3 ${cls}`}>
      <span className="shrink-0 w-9 h-9 rounded-lg border-2 border-ink bg-lime grid place-items-center font-display text-lg">
        {String.fromCharCode(65 + index)}
      </span>
      <span className="flex-1">{label}</span>
      {(state === "correct" || state === "picked-correct") && <span className="bg-mint border-2 border-ink rounded-full w-7 h-7 grid place-items-center font-bold">✓</span>}
      {state === "picked-wrong" && <span className="text-white bg-destructive border-2 border-ink rounded-full w-7 h-7 grid place-items-center font-bold">✗</span>}
    </button>
  );
}

/** Themed progress rail with motif "vehicle" riding it. */
export function GenProgress({ value, max }: { value: number; max: number }) {
  const theme = useGenTheme();
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  const t = toneClasses(theme.tone);
  return (
    <div className="relative h-3.5 rounded-full border-2 border-ink bg-card overflow-hidden">
      <div className={`absolute inset-y-0 left-0 ${t.gradient} transition-all`} style={{ width: `${pct}%` }} />
    </div>
  );
}

/** Particle burst overlay (correct answers, level ups). */
export function GenBurst({ count = 18 }: { items?: string[]; count?: number }) {
  const colors = ["var(--pink)", "var(--lime)", "var(--mint)", "var(--sky)", "var(--coral)"];
  const parts = useMemo(
    () => Array.from({ length: count }, (_, i) => ({
      color: colors[i % colors.length],
      round: i % 3 === 0,
      x: Math.random() * 100,
      y: 50 + Math.random() * 30,
      delay: Math.random() * 0.2,
      dur: 0.8 + Math.random() * 0.7,
      rot: (Math.random() - 0.5) * 720,
      scale: 0.8 + Math.random() * 0.9,
    })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [count],
  );
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-50 overflow-hidden motion-reduce:hidden">
      {parts.map((p, i) => (
        <span key={i} className={`absolute h-3.5 w-3.5 border-2 border-ink ${p.round ? "rounded-full" : "rounded-[3px]"}`}
          style={{
            left: `${p.x}%`, top: `${p.y}%`, background: p.color,
            animation: `gen-burst ${p.dur}s ease-out ${p.delay}s forwards`,
            ["--rot" as string]: `${p.rot}deg`,
            ["--scale" as string]: `${p.scale}`,
          } as React.CSSProperties} />
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
  const profile = useProfile();
  const t = toneClasses(tone ?? theme.tone);
  const motion = intensity === "calm" ? "" : "animate-pop-in";
  return (
    <div className={`flex items-end gap-3 ${motion}`}>
      <Companion id={profile?.companion ?? "igno"} size={56} state={intensity === "epic" ? "celebrate" : "happy"} interactive={false} />
      <div className={`relative ${t.bg} ${t.text} rounded-2xl rounded-bl-sm px-4 py-3 font-semibold sticker-sm max-w-xs`}>
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
      <div className={`pointer-events-auto rounded-3xl ${t.gradient} ${t.text} px-6 py-4 sticker animate-pop-in max-w-md text-center`}>
        <div className="font-display text-2xl">{stripEmoji(reaction.headline)}</div>
        <div className="text-sm opacity-90 mt-1">{stripEmoji(reaction.message)}</div>
      </div>
    </div>
  );
}