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

export const INK = "#141218";

/**
 * Two pill eyes. Everything the character feels is here: they stretch when
 * surprised, droop inward when sad, flatten when sleepy and curve when happy.
 */
function Eyes({
  spec,
  look,
  blink,
  gaze,
}: {
  spec: CharacterSpec;
  look: EyeLook;
  blink: boolean;
  gaze: { x: number; y: number };
}) {
  const [cx, cy] = SHAPES[spec.shape].eyes;
  const { w, gap, tilt } = spec.eyes;
  const h = look === "wide" ? spec.eyes.h * 1.2 : look === "low" ? spec.eyes.h * 0.8 : spec.eyes.h;
  return (
    <g style={{ transform: `translate(${gaze.x}px, ${gaze.y}px)`, transition: "transform 220ms cubic-bezier(0.2, 0, 0, 1)" }}>
      {[-1, 1].map((side) => {
        const x = cx + side * gap;
        const y = cy + (look === "low" ? 5 : 0);
        if (look === "arc") {
          return (
            <path
              key={side}
              d={`M${x - w * 0.75} ${cy + 4}Q${x} ${cy - w * 1.1} ${x + w * 0.75} ${cy + 4}`}
              stroke={INK}
              strokeWidth={w * 0.72}
              strokeLinecap="round"
              fill="none"
              transform={`rotate(${tilt} ${x} ${cy})`}
            />
          );
        }
        if (look === "closed") {
          return (
            <rect
              key={side}
              x={x - w * 0.8}
              y={cy - w * 0.32}
              width={w * 1.6}
              height={w * 0.64}
              rx={w * 0.32}
              fill={INK}
              transform={`rotate(${tilt * 0.5} ${x} ${cy})`}
            />
          );
        }
        // Sad eyes lean in at the top; otherwise both follow the character's tilt.
        const rot = look === "low" ? tilt + side * -14 : tilt;
        const hh = blink ? w * 0.4 : h;
        return (
          <rect
            key={side}
            x={x - w / 2}
            y={y - hh / 2}
            width={w}
            height={hh}
            rx={w / 2}
            fill={INK}
            transform={`rotate(${rot} ${x} ${y})`}
            style={{ transition: "height 90ms, y 90ms" }}
          />
        );
      })}
    </g>
  );
}

function Body({
  spec,
  look,
  blink,
  gaze,
}: {
  spec: CharacterSpec;
  look: EyeLook;
  blink: boolean;
  gaze: { x: number; y: number };
}) {
  return (
    <>
      <path d={SHAPES[spec.shape].path} fill={spec.color} />
      <Eyes spec={spec} look={look} blink={blink} gaze={gaze} />
    </>
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
      <Body spec={spec} look={look} blink={false} gaze={{ x: 0, y: 0 }} />
    </svg>
  );
}

/**
 * A companion: a flat, soft shape with two pill eyes and no mouth. It blinks,
 * follows the pointer with its eyes, shows how it feels through them, breathes
 * with its voice, and now and then plays its own habit (a tilt, a hop, a squash
 * or a slow sway).
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

  // Blink every few seconds (sometimes twice).
  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    const schedule = () => {
      t = setTimeout(
        () => {
          setBlink(true);
          t = setTimeout(() => {
            setBlink(false);
            if (Math.random() < 0.25) {
              t = setTimeout(() => {
                setBlink(true);
                t = setTimeout(() => {
                  setBlink(false);
                  schedule();
                }, 110);
              }, 140);
            } else schedule();
          }, 120);
        },
        2400 + Math.random() * 3600,
      );
    };
    schedule();
    return () => clearTimeout(t);
  }, []);

  // Each character's own habit, every 7–13 s while idle.
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
            }, 1200);
          } else schedule();
        },
        7000 + Math.random() * 6000,
      );
    };
    schedule();
    return () => clearTimeout(t);
  }, []);

  // Eyes follow the pointer.
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
        setLook({ x: Math.round(clamp(dx / 240) * 9), y: Math.round(clamp(dy / 240) * 7) });
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
      body.style.transform = `scale(${1 + v * 0.05}, ${1 - v * 0.035})`;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [state]);

  const eyeLook: EyeLook = poked ? "arc" : EYES_FOR[state];
  const gaze =
    state === "thinking"
      ? { x: 8, y: -8 }
      : state === "sleepy" || state === "sad"
        ? { x: 0, y: 4 }
        : look;
  const motion =
    state === "celebrate" || poked
      ? "mascot-hop"
      : quirk
        ? `mascot-${spec.quirk}`
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
          <g ref={bodyRef} style={{ transformOrigin: "100px 174px", transformBox: "view-box" }}>
            <Body spec={spec} look={eyeLook} blink={blink && eyeLook !== "arc" && eyeLook !== "closed"} gaze={gaze} />
          </g>
        </g>
      </svg>
    </div>
  );
}
