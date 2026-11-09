import { useEffect, useRef, useState } from "react";
import type { CompanionId } from "@/lib/profile";
import {
  CHARACTERS,
  SHAPES,
  characterForShape,
  type CharacterSpec,
  type GeoShape,
} from "./characters";

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

export type EyeLook = "open" | "wide" | "arc" | "closed" | "low";

const EYES_FOR: Record<CompanionState, EyeLook> = {
  idle: "open",
  listening: "wide",
  thinking: "open",
  speaking: "open",
  happy: "arc",
  celebrate: "arc",
  sad: "low",
  surprised: "wide",
  sleepy: "closed",
};

/** Eyebrow pose: vertical lift and inner tilt (degrees, positive = worried). */
type Brow = { lift: number; tilt: number; raiseRight?: number };
const BROWS_FOR: Record<CompanionState, Brow> = {
  idle: { lift: 0, tilt: 0 },
  listening: { lift: 5, tilt: 0 },
  thinking: { lift: 0, tilt: -6, raiseRight: 8 },
  speaking: { lift: 2, tilt: 0 },
  happy: { lift: 4, tilt: 0 },
  celebrate: { lift: 7, tilt: 0 },
  sad: { lift: 2, tilt: 16 },
  surprised: { lift: 9, tilt: 0 },
  sleepy: { lift: -2, tilt: 6 },
};

export const INK = "var(--ink, #17141c)";
const STROKE = 7;

function Accessory({ spec }: { spec: CharacterSpec }) {
  switch (spec.accessory) {
    case "cap":
      // Graduation cap, worn slightly crooked.
      return (
        <g transform="rotate(-9 100 34)" stroke={INK} strokeWidth={5} strokeLinejoin="round">
          <path d="M74 34V50Q100 62 126 50V34Z" fill={INK} />
          <path d="M50 30L100 10L150 30L100 50Z" fill={INK} />
          <path d="M100 30L142 36V58" fill="none" stroke="var(--lime)" strokeWidth={4} strokeLinecap="round" />
          <circle cx={142} cy={62} r={6} fill="var(--lime)" stroke={INK} strokeWidth={3} />
        </g>
      );
    case "spark":
      // "Ooh, me!" marks above the head.
      return (
        <g stroke={INK} strokeWidth={6} strokeLinecap="round">
          <path d="M100 2V12" />
          <path d="M72 10L79 18" />
          <path d="M128 10L121 18" />
        </g>
      );
    case "glasses":
      return null; // Drawn with the eyes so they follow the gaze.
    case "beret":
      return (
        <g stroke={INK} strokeWidth={5} strokeLinejoin="round">
          <path d="M98 10V18" strokeLinecap="round" />
          <path d="M52 40Q56 14 100 16Q144 18 136 40Q100 50 52 40Z" fill="var(--pink)" />
        </g>
      );
  }
}

/** Ears/pencil and other bits that sit behind the eyes but on top of the body. */
function Pencil() {
  return (
    <g transform="rotate(38 158 44)" stroke={INK} strokeWidth={4} strokeLinejoin="round">
      <rect x={146} y={10} width={20} height={64} rx={3} fill="#ffd23f" />
      <rect x={146} y={4} width={20} height={12} rx={3} fill="var(--pink)" />
      <path d="M146 74L156 92L166 74Z" fill="#fff4dc" />
      <path d="M153 86L156 92L159 86Z" fill={INK} />
    </g>
  );
}

function Eyes({
  spec,
  look,
  blink,
  gaze,
  brow,
}: {
  spec: CharacterSpec;
  look: EyeLook;
  blink: boolean;
  gaze: { x: number; y: number };
  brow: Brow;
}) {
  const { eyes, eyeGap } = SHAPES[spec.shape];
  const [cx, cy] = eyes;
  const style = spec.eyes;
  const closed = look === "closed" || blink;
  const big = style === "googly" || style === "dreamy";
  const r = big ? 15 : style === "dot" ? 13 : 0;

  return (
    <g>
      {/* Eyebrows */}
      {[-1, 1].map((side) => {
        const x = cx + side * eyeGap;
        const baseY = cy - (big || style === "dot" ? 30 : 24);
        const lift = brow.lift + (side === 1 ? (brow.raiseRight ?? 0) : 0);
        const tilt = side * -brow.tilt + (style === "spark" ? side * 10 : 0);
        return (
          <path
            key={`b${side}`}
            d={`M${x - 10} ${baseY}Q${x} ${baseY - 5} ${x + 10} ${baseY}`}
            stroke={INK}
            strokeWidth={5.5}
            strokeLinecap="round"
            fill="none"
            style={{
              transform: `translateY(${-lift}px) rotate(${tilt}deg)`,
              transformBox: "fill-box",
              transformOrigin: "center",
              transition: "transform 240ms cubic-bezier(0.2, 0, 0, 1)",
            }}
          />
        );
      })}

      {/* Cheeks */}
      {[-1, 1].map((side) => (
        <ellipse
          key={`c${side}`}
          cx={cx + side * (eyeGap + 14)}
          cy={cy + 20}
          rx={9}
          ry={5}
          fill={spec.cheek}
          opacity={0.55}
        />
      ))}

      {[-1, 1].map((side) => {
        const x = cx + side * eyeGap;
        if (look === "arc") {
          return (
            <path
              key={side}
              d={`M${x - 11} ${cy + 4}Q${x} ${cy - 11} ${x + 11} ${cy + 4}`}
              stroke={INK}
              strokeWidth={6}
              fill="none"
              strokeLinecap="round"
            />
          );
        }
        if (closed) {
          return (
            <path
              key={side}
              d={`M${x - 10} ${cy}Q${x} ${cy + 7} ${x + 10} ${cy}`}
              stroke={INK}
              strokeWidth={6}
              fill="none"
              strokeLinecap="round"
            />
          );
        }
        const wide = look === "wide" ? 1.15 : 1;
        const low = look === "low" ? 4 : 0;
        if (style === "spark") {
          // Tall ink ovals with a shine: quick and eager.
          return (
            <g key={side} style={{ transform: `translate(${gaze.x}px, ${gaze.y}px)`, transition: "transform 220ms" }}>
              <ellipse cx={x} cy={cy + low} rx={8 * wide} ry={(look === "low" ? 8 : 12) * wide} fill={INK} />
              <circle cx={x + 3} cy={cy + low - 5} r={3} fill="#fff" />
            </g>
          );
        }
        // White eye + pupil that follows the gaze.
        const pr = style === "dot" ? 5.5 : 7.5;
        return (
          <g key={side}>
            <circle cx={x} cy={cy + low} r={r * wide} fill="#fff" stroke={INK} strokeWidth={4.5} />
            <g style={{ transform: `translate(${gaze.x}px, ${gaze.y + low}px)`, transition: "transform 220ms" }}>
              <circle cx={x} cy={cy} r={pr} fill={INK} />
              <circle cx={x + 2} cy={cy - 2.5} r={2} fill="#fff" />
            </g>
            {style === "dreamy" && (
              // Heavy upper lid: calm, a bit dreamy.
              <path
                d={`M${x - r - 3} ${cy + low - 1}A${r + 3} ${r + 3} 0 0 1 ${x + r + 3} ${cy + low - 1}Z`}
                fill={spec.color}
                stroke={INK}
                strokeWidth={4.5}
                strokeLinejoin="round"
              />
            )}
          </g>
        );
      })}

      {spec.accessory === "glasses" && (
        <g stroke={INK} strokeWidth={5} fill="none">
          <circle cx={cx - eyeGap} cy={cy} r={20} fill="#fff" fillOpacity={0.25} />
          <circle cx={cx + eyeGap} cy={cy} r={20} fill="#fff" fillOpacity={0.25} />
          <path d={`M${cx - eyeGap + 20} ${cy - 2}Q${cx} ${cy - 10} ${cx + eyeGap - 20} ${cy - 2}`} />
        </g>
      )}
    </g>
  );
}

function Body({
  spec,
  look,
  blink,
  gaze,
  brow,
}: {
  spec: CharacterSpec;
  look: EyeLook;
  blink: boolean;
  gaze: { x: number; y: number };
  brow: Brow;
}) {
  return (
    // Scaled down so hats and pencils fit inside the 200×200 box.
    <g transform="translate(16 26) scale(0.84)">
      {spec.accessory === "glasses" && <Pencil />}
      <path
        d={SHAPES[spec.shape].path}
        fill={spec.color}
        stroke={INK}
        strokeWidth={STROKE}
        strokeLinejoin="round"
      />
      <Eyes spec={spec} look={look} blink={blink} gaze={gaze} brow={brow} />
      <Accessory spec={spec} />
    </g>
  );
}

/** Static mascot (no timers) for decorative spots. */
export function GeoMascot({
  shape = "circle",
  id,
  color,
  size = 64,
  look = "open",
  className = "",
}: {
  shape?: GeoShape;
  id?: CompanionId;
  color?: string;
  size?: number;
  look?: EyeLook;
  className?: string;
}) {
  const base = id ? CHARACTERS[id] : characterForShape(shape);
  const spec = color ? { ...base, color } : base;
  return (
    <svg viewBox="0 0 200 200" width={size} height={size} className={className} aria-hidden>
      <Body spec={spec} look={look} blink={false} gaze={{ x: 0, y: 0 }} brow={BROWS_FOR.idle} />
    </svg>
  );
}

/**
 * A companion: a geometric shape with eyes, brows and a school accessory. No mouth —
 * it shows how it feels with its eyes and brows, follows the pointer with its pupils,
 * and now and then plays its own little habit (a head tilt, a hop, a raised brow…).
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
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const bodyRef = useRef<SVGGElement | null>(null);
  const levelRef = useRef(getLevel);
  levelRef.current = getLevel;
  const stateRef = useRef(state);
  stateRef.current = state;
  const [blink, setBlink] = useState(false);
  const [look, setLook] = useState({ x: 0, y: 0 });
  const [poked, setPoked] = useState(false);
  const [quirk, setQuirk] = useState(false);

  // Blink every few seconds.
  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    const schedule = () => {
      t = setTimeout(
        () => {
          setBlink(true);
          t = setTimeout(() => {
            setBlink(false);
            schedule();
          }, 130);
        },
        2600 + Math.random() * 3400,
      );
    };
    schedule();
    return () => clearTimeout(t);
  }, []);

  // Each character's own habit, every 8–14 s while idle.
  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    const schedule = () => {
      t = setTimeout(
        () => {
          if (stateRef.current === "idle") {
            setQuirk(true);
            t = setTimeout(() => {
              setQuirk(false);
              schedule();
            }, 1100);
          } else schedule();
        },
        8000 + Math.random() * 6000,
      );
    };
    schedule();
    return () => clearTimeout(t);
  }, []);

  // Pupils follow the pointer.
  useEffect(() => {
    let raf = 0;
    let visible = true;
    const el = wrapRef.current;
    const io = el
      ? new IntersectionObserver(([e]) => {
          visible = e.isIntersecting;
        })
      : null;
    if (el && io) io.observe(el);
    const onMove = (e: PointerEvent) => {
      if (!visible || raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const r = wrapRef.current?.getBoundingClientRect();
        if (!r) return;
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);
        const clamp = (v: number) => Math.max(-1, Math.min(1, v));
        setLook({ x: Math.round(clamp(dx / 260) * 5), y: Math.round(clamp(dy / 260) * 4) });
      });
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
      io?.disconnect();
    };
  }, []);

  // While speaking, the body breathes with the loudness of the voice.
  useEffect(() => {
    const body = bodyRef.current;
    if (!body) return;
    if (state !== "speaking") {
      body.style.transform = "";
      return;
    }
    let raf = 0;
    const tick = (ms: number) => {
      raf = requestAnimationFrame(tick);
      const lvl = levelRef.current?.() ?? -1;
      const v = lvl >= 0 ? Math.min(1, lvl * 2.2) : 0.3 + Math.sin(ms / 160) * 0.3;
      body.style.transform = `scale(${1 + v * 0.04}, ${1 - v * 0.025})`;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [state]);

  const eyeLook: EyeLook = poked ? "arc" : EYES_FOR[state];
  const gaze =
    state === "thinking"
      ? { x: 4, y: -4 }
      : state === "sleepy" || state === "sad"
        ? { x: 0, y: 3 }
        : look;
  let brow = poked ? BROWS_FOR.happy : BROWS_FOR[state];
  if (quirk && spec.quirk === "brow") brow = { ...brow, raiseRight: 10 };
  const slowBlink = quirk && spec.quirk === "slowblink";
  const motion =
    state === "celebrate"
      ? "mascot-hop"
      : quirk && spec.quirk === "tilt"
        ? "mascot-tilt"
        : quirk && spec.quirk === "hop"
          ? "mascot-hop"
          : undefined;

  return (
    <div
      ref={wrapRef}
      className={`relative inline-block select-none ${interactive ? "cursor-pointer" : ""} ${className}`}
      style={{ width: size, height: size }}
      onPointerDown={() => {
        if (!interactive) return;
        setPoked(true);
        setTimeout(() => setPoked(false), 700);
      }}
      role={label ? "img" : undefined}
      aria-label={label}
    >
      <svg viewBox="0 0 200 200" width={size} height={size} className="overflow-visible">
        <g key={motion ?? "rest"} className={motion}>
          <g ref={bodyRef} style={{ transformOrigin: "100px 166px", transformBox: "view-box" }}>
            <Body
              spec={spec}
              look={eyeLook}
              blink={(blink || slowBlink) && eyeLook !== "arc" && eyeLook !== "closed"}
              gaze={gaze}
              brow={brow}
            />
          </g>
        </g>
      </svg>
    </div>
  );
}
