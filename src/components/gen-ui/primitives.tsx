import { ReactNode, useEffect, useMemo, useState } from "react";
import { GenTheme, Tone, themeFromInterests, toneClasses } from "@/lib/theme-from-interests";
import { useProfile } from "@/lib/profile";
import { Link } from "@tanstack/react-router";

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
    <div className={`rounded-3xl ${soft ? `bg-card border ${t.border}/40` : `${t.bg} ${t.text}`} p-5 shadow-soft ${className}`}>
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
  // Layered: themed gradient wash + dense floating motifs.
  const motifs = useMemo(() => {
    const out: { char: string; top: number; left: number; size: number; delay: number; dur: number; spin: number }[] = [];
    const pool = theme.motifs;
    for (let i = 0; i < 22; i++) {
      out.push({
        char: pool[i % pool.length],
        top: (i * 17 + 7) % 95,
        left: (i * 37 + 11) % 95,
        size: 1.4 + ((i * 13) % 7) / 3,
        delay: (i % 8) * 0.4,
        dur: 5 + ((i * 11) % 5),
        spin: (i % 2 === 0 ? 1 : -1) * (3 + (i % 4)),
      });
    }
    return out;
  }, [theme.motifs]);
  const t = toneClasses(theme.tone);
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className={`absolute inset-0 ${t.gradient} opacity-[0.07]`} />
      {motifs.map((m, i) => (
        <span key={i} className="absolute select-none"
          style={{
            top: `${m.top}%`, left: `${m.left}%`,
            fontSize: `${m.size}rem`, opacity: 0.18,
            animation: `gen-drift ${m.dur}s ease-in-out ${m.delay}s infinite alternate`,
            ["--spin" as string]: `${m.spin}deg`,
          } as React.CSSProperties}>{m.char}</span>
      ))}
      <style>{`
        @keyframes gen-drift {
          0%   { transform: translate(0,0) rotate(0); }
          100% { transform: translate(8px,-12px) rotate(var(--spin)); }
        }
      `}</style>
    </div>
  );
}

/** Loud, persistent banner: "Modo X activado, personalizado para Niño".
 *  Goal: the kid SEES that the platform is shaped to them. */
export function GenThemeBanner({ subtitle, compact = false }: { subtitle?: string; compact?: boolean }) {
  const theme = useGenTheme();
  const profile = useProfile();
  const t = toneClasses(theme.tone);
  return (
    <Link to="/perfil" className={`relative block overflow-hidden rounded-3xl ${t.gradient} ${t.text} shadow-soft animate-pop-in ${compact ? "px-4 py-2.5" : "px-5 py-4"}`}>
      {/* drifting motifs inside the banner itself */}
      <div aria-hidden className="absolute inset-0 pointer-events-none">
        {theme.motifs.concat(theme.motifs).map((m, i) => (
          <span key={i} className="absolute select-none"
            style={{
              top: `${(i * 23) % 90}%`, left: `${(i * 41 + 7) % 95}%`,
              fontSize: `${1 + (i % 3) * 0.4}rem`, opacity: 0.35,
              animation: `gen-banner-float ${4 + (i % 3)}s ease-in-out ${i * 0.2}s infinite alternate`,
            }}>{m}</span>
        ))}
      </div>
      <div className="relative flex items-center gap-3">
        <div className={`text-3xl ${compact ? "text-2xl" : ""} animate-bounce-slow`}>{theme.motifs[0]}</div>
        <div className="flex-1 min-w-0">
          <div className="text-[10px] font-bold uppercase tracking-[0.18em] opacity-90">Modo personalizado</div>
          <div className={`font-display font-bold leading-tight truncate ${compact ? "text-base" : "text-xl"}`}>
            {theme.label.toUpperCase()}
          </div>
          {!compact && (
            <div className="text-xs opacity-90 mt-0.5">
              {subtitle ?? `IA adaptando todo para ${profile?.childName ?? "ti"} · toca para cambiar tu mundo`}
            </div>
          )}
        </div>
        <div className="flex gap-1 text-xl opacity-90">
          {theme.motifs.slice(1, 4).map((m, i) => <span key={i}>{m}</span>)}
        </div>
      </div>
      <style>{`
        @keyframes gen-banner-float {
          0%   { transform: translate(0,0) rotate(-4deg); }
          100% { transform: translate(6px,-4px) rotate(6deg); }
        }
      `}</style>
    </Link>
  );
}

/** Adaptive quiz option: themed motif bullet, themed states, micro-burst on hover. */
export function GenQuizOption({ index, label, state, onPick, disabled }: {
  index: number; label: string;
  state: "idle" | "correct" | "wrong" | "muted" | "picked-correct" | "picked-wrong";
  onPick: () => void; disabled?: boolean;
}) {
  const theme = useGenTheme();
  const motif = theme.motifs[index % theme.motifs.length];
  const cls =
    state === "correct" || state === "picked-correct" ? "border-mint bg-mint/25 ring-2 ring-mint/40"
    : state === "picked-wrong" ? "border-destructive bg-destructive/15"
    : state === "muted"        ? "border-border opacity-50"
    : state === "wrong"        ? "border-destructive/50"
    : "border-border hover:border-primary hover:bg-primary/5 hover:-translate-y-0.5";
  const tone = toneClasses(theme.tone);
  return (
    <button onClick={onPick} disabled={disabled}
      className={`group w-full text-left rounded-2xl border-2 p-4 font-semibold transition-all flex items-center gap-3 ${cls}`}>
      <span className={`shrink-0 w-10 h-10 rounded-xl ${tone.bgSoft} ${tone.border} border-2 grid place-items-center text-xl group-hover:rotate-6 transition-transform`}>
        {motif}
      </span>
      <span className="flex-1">{label}</span>
      {(state === "correct" || state === "picked-correct") && <span className="text-mint-foreground bg-mint rounded-full w-7 h-7 grid place-items-center">✓</span>}
      {state === "picked-wrong" && <span className="text-destructive-foreground bg-destructive rounded-full w-7 h-7 grid place-items-center">✗</span>}
    </button>
  );
}

/** Themed progress rail with motif "vehicle" riding it. */
export function GenProgress({ value, max }: { value: number; max: number }) {
  const theme = useGenTheme();
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  const t = toneClasses(theme.tone);
  return (
    <div className="relative h-3 rounded-full bg-muted overflow-visible">
      <div className={`absolute inset-y-0 left-0 ${t.gradient} rounded-full transition-all`} style={{ width: `${pct}%` }} />
      <span className="absolute -top-2.5 text-xl transition-all"
        style={{ left: `calc(${pct}% - 12px)` }}>{theme.motifs[0]}</span>
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