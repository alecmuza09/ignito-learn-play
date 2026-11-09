import { useEffect, useId, useRef, useState } from "react";
import type { CompanionId } from "@/lib/profile";
import { CHARACTERS } from "./characters";

export type CompanionState =
  | "idle"
  | "listening"
  | "thinking"
  | "speaking"
  | "happy"
  | "celebrate"
  | "sad"
  | "surprised"
  | "sleepy";

interface Face {
  smile: number; // -1 frown … 1 big smile
  eyeOpen: number; // 0 closed … 1.3 wide
  joy: number; // 0 round eyes … 1 happy arcs
  tilt: number; // head tilt in degrees
  energy: number; // 0 calm … 1 hyper
  lookX: number; // -1 … 1
  lookY: number;
  round: number; // 0 smile mouth … 1 "o" mouth
}

const TARGETS: Record<CompanionState, Omit<Face, "lookX" | "lookY">> = {
  idle: { smile: 0.5, eyeOpen: 1, joy: 0, tilt: 0, energy: 0.25, round: 0 },
  listening: { smile: 0.6, eyeOpen: 1.12, joy: 0, tilt: -7, energy: 0.35, round: 0 },
  thinking: { smile: 0.1, eyeOpen: 0.82, joy: 0, tilt: 9, energy: 0.3, round: 0.2 },
  speaking: { smile: 0.55, eyeOpen: 1, joy: 0.15, tilt: 0, energy: 0.5, round: 0 },
  happy: { smile: 1, eyeOpen: 1, joy: 1, tilt: -4, energy: 0.7, round: 0 },
  celebrate: { smile: 1, eyeOpen: 1, joy: 1, tilt: 0, energy: 1, round: 0 },
  sad: { smile: -0.6, eyeOpen: 0.9, joy: 0, tilt: -5, energy: 0.1, round: 0 },
  surprised: { smile: 0, eyeOpen: 1.3, joy: 0, tilt: 0, energy: 0.6, round: 1 },
  sleepy: { smile: 0.2, eyeOpen: 0.15, joy: 0, tilt: 6, energy: 0, round: 0 },
};

const lerp = (a: number, b: number, k: number) => a + (b - a) * k;

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const h = () => setReduced(mq.matches);
    mq.addEventListener("change", h);
    return () => mq.removeEventListener("change", h);
  }, []);
  return reduced;
}

interface Sparkle {
  born: number;
  angle: number;
  dist: number;
  hue: number;
  kind: "star" | "heart";
}

/**
 * Living companion: breathes, blinks, follows the pointer, changes expression with `state`,
 * and lip-syncs when `getLevel` returns the current voice loudness (0..1).
 */
export function Companion({
  id = "igno",
  size = 120,
  state = "idle",
  getLevel,
  interactive = true,
  className = "",
  label,
}: {
  id?: CompanionId;
  size?: number;
  state?: CompanionState;
  getLevel?: () => number;
  interactive?: boolean;
  className?: string;
  label?: string;
}) {
  const spec = CHARACTERS[id] ?? CHARACTERS.igno;
  const reduced = usePrefersReducedMotion();
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const stateRef = useRef(state);
  const levelRef = useRef(getLevel);
  const pointer = useRef<{ x: number; y: number } | null>(null);
  const poke = useRef(0);
  const sparkles = useRef<Sparkle[]>([]);
  const face = useRef<Face>({ ...TARGETS.idle, lookX: 0, lookY: 0 });
  const blink = useRef({ next: 2, until: 0 });
  const mouth = useRef(0);
  const visible = useRef(true);
  const [frame, setFrame] = useState(0);
  const [mounted, setMounted] = useState(false);
  const uid = useId().replace(/:/g, "");

  stateRef.current = state;
  levelRef.current = getLevel;

  // Burst of sparkles whenever the companion gets excited.
  useEffect(() => {
    if (state !== "celebrate" && state !== "happy") return;
    const now = performance.now() / 1000;
    const n = state === "celebrate" ? 14 : 6;
    sparkles.current = sparkles.current.concat(
      Array.from({ length: n }, (_, i) => ({
        born: now + i * 0.03,
        angle: (i / n) * Math.PI * 2 + Math.random() * 0.4,
        dist: 60 + Math.random() * 40,
        hue: [295, 50, 175, 245, 0][i % 5],
        kind: "star" as const,
      })),
    );
  }, [state]);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      pointer.current = { x: e.clientX, y: e.clientY };
    };
    setMounted(true);
    window.addEventListener("pointermove", onMove, { passive: true });
    const el = wrapRef.current;
    const io = el
      ? new IntersectionObserver(([entry]) => {
          visible.current = entry.isIntersecting;
        })
      : null;
    if (el && io) io.observe(el);

    let raf = 0;
    let last = performance.now();
    const loop = (nowMs: number) => {
      raf = requestAnimationFrame(loop);
      if (!visible.current || document.hidden) return;
      const dt = Math.min(0.05, (nowMs - last) / 1000);
      last = nowMs;
      const t = nowMs / 1000;
      const st = stateRef.current;
      const target = TARGETS[st];
      const f = face.current;
      const k = 1 - Math.pow(0.001, dt); // frame-rate independent smoothing (~150ms)

      // Gaze: pointer when near, scripted otherwise.
      let gx = Math.sin(t * 0.35) * 0.4;
      let gy = Math.sin(t * 0.23) * 0.2;
      if (st === "thinking") {
        gx = 0.7;
        gy = -0.8;
      } else if (st === "sleepy") {
        gx = 0;
        gy = 0.4;
      } else if (pointer.current && wrapRef.current) {
        const r = wrapRef.current.getBoundingClientRect();
        const dx = pointer.current.x - (r.left + r.width / 2);
        const dy = pointer.current.y - (r.top + r.height / 2);
        const d = Math.hypot(dx, dy);
        if (d < 900) {
          gx = Math.max(-1, Math.min(1, dx / 220));
          gy = Math.max(-1, Math.min(1, dy / 220));
        }
      }

      const poked = t - poke.current < 0.9;
      f.smile = lerp(f.smile, poked ? 1 : target.smile, k);
      f.eyeOpen = lerp(f.eyeOpen, target.eyeOpen, k);
      f.joy = lerp(f.joy, poked ? 1 : target.joy, k);
      f.tilt = lerp(f.tilt, target.tilt, k * 0.7);
      f.energy = lerp(f.energy, poked ? 0.9 : target.energy, k);
      f.round = lerp(f.round, target.round, k);
      f.lookX = lerp(f.lookX, gx, k * 0.8);
      f.lookY = lerp(f.lookY, gy, k * 0.8);

      // Mouth: real voice loudness, or a syllable-like wobble when speaking without audio.
      let m = 0;
      if (st === "speaking") {
        const lvl = levelRef.current?.();
        m =
          lvl !== undefined && lvl >= 0
            ? Math.min(1, lvl * 2.4)
            : Math.max(0, Math.sin(t * 13) * 0.5 + Math.sin(t * 7.3) * 0.35 + 0.15);
      } else if (st === "surprised") m = 0.6;
      mouth.current = lerp(mouth.current, m, st === "speaking" ? 0.55 : k);

      // Blink every few seconds (double blink now and then).
      const b = blink.current;
      if (t > b.next) {
        b.until = t + 0.13;
        b.next = t + (Math.random() < 0.15 ? 0.25 : 2.2 + Math.random() * 3.8);
      }

      sparkles.current = sparkles.current.filter((s) => t - s.born < 1.2);
      setFrame((n) => (n + 1) % 1_000_000);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      io?.disconnect();
    };
  }, []);

  void frame;
  const t = mounted ? performance.now() / 1000 : 0;
  const f = face.current;
  const motion = reduced ? 0.2 : 1;
  const e = f.energy;

  // Body motion: float, breathe, squash on poke and hop when celebrating.
  const pokeAge = t - poke.current;
  const squash = pokeAge < 0.6 ? Math.sin(pokeAge * 18) * Math.exp(-pokeAge * 6) * 0.16 : 0;
  const breathe = Math.sin(t * (1.6 + e * 2)) * (0.018 + e * 0.02);
  const hop =
    state === "celebrate"
      ? Math.abs(Math.sin(t * 7)) * -18
      : state === "happy"
        ? Math.abs(Math.sin(t * 5)) * -6
        : 0;
  const float = Math.sin(t * 1.4) * 4 + hop;
  const sx = 1 + squash - breathe * 0.5;
  const sy = 1 - squash + breathe;
  const sway = Math.sin(t * 0.9) * 2 * (0.4 + e);
  const tilt = f.tilt + sway * motion;

  const b = blink.current;
  const blinking = t < b.until;
  const eyeScale = blinking ? 0.08 : Math.max(0.08, f.eyeOpen);
  const px = f.lookX * 5;
  const py = f.lookY * 4;
  const [mx, my] = spec.mouth;
  const mo = mouth.current;
  const w = 13 - f.round * 5 + mo * 2;
  const curve = f.smile * 9;
  const mouthPath = `M${mx - w} ${my} Q${mx} ${my + curve - mo * 3} ${mx + w} ${my} Q${mx} ${my + curve + 4 + mo * 20 + f.round * 8} ${mx - w} ${my} Z`;

  const onPoke = () => {
    if (!interactive) return;
    poke.current = performance.now() / 1000;
    const now = poke.current;
    sparkles.current = sparkles.current.concat(
      Array.from({ length: 4 }, (_, i) => ({
        born: now + i * 0.05,
        angle: -Math.PI / 2 + (i - 1.5) * 0.5,
        dist: 50 + i * 6,
        hue: 0,
        kind: "heart" as const,
      })),
    );
  };

  return (
    <div
      ref={wrapRef}
      className={`relative inline-block select-none ${interactive ? "cursor-pointer" : ""} ${className}`}
      style={{ width: size, height: size }}
      onPointerDown={onPoke}
      role={label ? "img" : undefined}
      aria-label={label}
    >
      <svg viewBox="0 0 200 200" width={size} height={size} className="overflow-visible">
        <defs>
          <radialGradient id={`glow-${uid}`} cx="50%" cy="55%" r="50%">
            <stop offset="0%" stopColor={spec.body} stopOpacity={0.35 + e * 0.25} />
            <stop offset="100%" stopColor={spec.body} stopOpacity={0} />
          </radialGradient>
          <radialGradient id={`shade-${uid}`} cx="38%" cy="30%" r="75%">
            <stop offset="0%" stopColor="white" stopOpacity={0.35} />
            <stop offset="55%" stopColor="white" stopOpacity={0} />
            <stop offset="100%" stopColor="black" stopOpacity={0.14} />
          </radialGradient>
        </defs>

        {/* aura + ground shadow */}
        <circle cx={100} cy={112} r={92} fill={`url(#glow-${uid})`} />
        <ellipse cx={100} cy={186} rx={52 - hop * 0.8} ry={6} fill="oklch(0.2 0.05 280 / 0.14)" />

        {/* listening rings */}
        {state === "listening" &&
          [0, 1, 2].map((i) => {
            const p = (t * 0.9 + i / 3) % 1;
            return (
              <circle
                key={i}
                cx={100}
                cy={110}
                r={70 + p * 40}
                fill="none"
                stroke={spec.body}
                strokeWidth={3}
                opacity={(1 - p) * 0.5}
              />
            );
          })}

        <g
          transform={`translate(0 ${float * motion}) rotate(${tilt} 100 170) translate(100 172) scale(${sx} ${sy}) translate(-100 -172)`}
        >
          {spec.back?.(t * motion, e)}
          <path d={spec.bodyPath} fill={spec.body} />
          <path d={spec.bodyPath} fill={`url(#shade-${uid})`} />
          <path d={spec.bodyPath} fill="none" stroke={spec.rim} strokeWidth={3} opacity={0.5} />

          {/* little arms that wave when excited or speaking */}
          {(() => {
            const armWave =
              state === "celebrate"
                ? Math.sin(t * 12) * 40
                : state === "speaking"
                  ? Math.sin(t * 4) * 10
                  : Math.sin(t * 1.5) * 4;
            return (
              <g fill={spec.rim}>
                <ellipse
                  cx={38}
                  cy={130}
                  rx={9}
                  ry={14}
                  transform={`rotate(${30 - armWave * motion} 44 120)`}
                />
                <ellipse
                  cx={162}
                  cy={130}
                  rx={9}
                  ry={14}
                  transform={`rotate(${-30 + armWave * motion} 156 120)`}
                />
              </g>
            );
          })()}

          {/* eyes */}
          {([spec.eyes.l, spec.eyes.r] as const).map(([ex, ey], i) => (
            <g key={i} transform={`translate(${ex + px} ${ey + py})`}>
              <g opacity={1 - f.joy} transform={`scale(1 ${eyeScale})`}>
                <ellipse cx={0} cy={0} rx={9} ry={12} fill="oklch(0.18 0.03 280)" />
                <circle cx={3 - px * 0.3} cy={-4 - py * 0.3} r={3.6} fill="white" />
                <circle cx={-3} cy={4} r={1.6} fill="white" opacity={0.8} />
              </g>
              <path
                d="M-9 3 Q0 -9 9 3"
                stroke="oklch(0.18 0.03 280)"
                strokeWidth={4.5}
                fill="none"
                strokeLinecap="round"
                opacity={f.joy}
              />
            </g>
          ))}

          {/* brows: worried when sad, raised when surprised */}
          {(state === "sad" || state === "surprised" || state === "thinking") && (
            <g stroke="oklch(0.18 0.03 280)" strokeWidth={3.5} strokeLinecap="round" opacity={0.8}>
              <line
                x1={spec.eyes.l[0] - 9}
                y1={spec.eyes.l[1] - 20 + (state === "sad" ? 0 : -4)}
                x2={spec.eyes.l[0] + 7}
                y2={spec.eyes.l[1] - 20 + (state === "sad" ? -5 : -4)}
              />
              <line
                x1={spec.eyes.r[0] - 7}
                y1={spec.eyes.r[1] - 20 + (state === "sad" ? -5 : state === "thinking" ? -8 : -4)}
                x2={spec.eyes.r[0] + 9}
                y2={spec.eyes.r[1] - 20 + (state === "sad" ? 0 : state === "thinking" ? -8 : -4)}
              />
            </g>
          )}

          {/* cheeks blush more when happy */}
          <ellipse
            cx={spec.eyes.l[0] - 10}
            cy={spec.eyes.l[1] + 16}
            rx={8}
            ry={5}
            fill={spec.cheek}
            opacity={0.5 + f.joy * 0.5}
          />
          <ellipse
            cx={spec.eyes.r[0] + 10}
            cy={spec.eyes.r[1] + 16}
            rx={8}
            ry={5}
            fill={spec.cheek}
            opacity={0.5 + f.joy * 0.5}
          />

          {/* mouth */}
          <path d={mouthPath} fill="oklch(0.25 0.06 20)" />
          {mo > 0.25 && (
            <ellipse
              cx={mx}
              cy={my + 6 + mo * 9}
              rx={w * 0.45}
              ry={2 + mo * 3}
              fill="oklch(0.70 0.16 15)"
              opacity={Math.min(1, (mo - 0.25) * 3)}
            />
          )}

          {spec.front?.(t * motion, e)}
        </g>

        {/* thinking bubbles */}
        {state === "thinking" &&
          [0, 1, 2].map((i) => (
            <circle
              key={i}
              cx={150 + i * 13}
              cy={52 - i * 14}
              r={4 + i * 2.5}
              fill="oklch(0.95 0.01 280)"
              stroke="oklch(0.80 0.02 280)"
              strokeWidth={1.5}
              opacity={0.5 + 0.5 * Math.sin(t * 4 - i)}
            />
          ))}

        {/* sleepy z's */}
        {state === "sleepy" &&
          [0, 1].map((i) => {
            const p = (t * 0.4 + i * 0.5) % 1;
            return (
              <text
                key={i}
                x={140 + p * 20}
                y={60 - p * 40}
                fontSize={14 + p * 8}
                fontWeight={800}
                fill={spec.rim}
                opacity={1 - p}
              >
                z
              </text>
            );
          })}

        {/* sparkles & hearts */}
        {sparkles.current.map((s, i) => {
          const age = t - s.born;
          if (age < 0) return null;
          const p = Math.min(1, age / 1.2);
          const ease = 1 - Math.pow(1 - p, 3);
          const x = 100 + Math.cos(s.angle) * s.dist * ease;
          const y = 100 + Math.sin(s.angle) * s.dist * ease - (s.kind === "heart" ? p * 30 : 0);
          const sc = (1 - p) * (s.kind === "heart" ? 1 : 1.2);
          return s.kind === "heart" ? (
            <path
              key={i}
              transform={`translate(${x} ${y}) scale(${sc})`}
              d="M0 4 C-8 -4 -6 -10 0 -6 C6 -10 8 -4 0 4 Z"
              fill="oklch(0.70 0.20 10)"
              opacity={1 - p}
            />
          ) : (
            <path
              key={i}
              transform={`translate(${x} ${y}) rotate(${age * 300}) scale(${sc})`}
              d="M0 -7 L2 -2 L7 0 L2 2 L0 7 L-2 2 L-7 0 L-2 -2 Z"
              fill={`oklch(0.82 0.16 ${s.hue})`}
              opacity={1 - p}
            />
          );
        })}
      </svg>
    </div>
  );
}
