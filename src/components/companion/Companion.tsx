import { useEffect, useRef, useState } from "react";
import type { CompanionId } from "@/lib/profile";
import { CHARACTERS, SHAPES, type GeoShape } from "./characters";

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

const INK = "oklch(0.2 0.02 270)";

/** A pair of eyes; everything the mascot feels is expressed here. */
function Eyes({
  shape,
  look,
  blink,
  dx,
  dy,
}: {
  shape: GeoShape;
  look: EyeLook;
  blink: boolean;
  dx: number;
  dy: number;
}) {
  const { eyes, eyeGap } = SHAPES[shape];
  const [cx, cy] = eyes;
  return (
    <g
      style={{
        transform: `translate(${dx}px, ${dy}px)`,
        transition: "transform 260ms cubic-bezier(0.2, 0, 0, 1)",
      }}
    >
      {[-1, 1].map((side) => {
        const x = cx + side * eyeGap;
        if (look === "arc") {
          return (
            <path
              key={side}
              d={`M${x - 9} ${cy + 3}Q${x} ${cy - 9} ${x + 9} ${cy + 3}`}
              stroke={INK}
              strokeWidth={5.5}
              fill="none"
              strokeLinecap="round"
            />
          );
        }
        if (look === "closed" || blink) {
          return (
            <path
              key={side}
              d={`M${x - 8} ${cy}Q${x} ${cy + 5} ${x + 8} ${cy}`}
              stroke={INK}
              strokeWidth={5}
              fill="none"
              strokeLinecap="round"
            />
          );
        }
        const rx = look === "wide" ? 8.5 : 7.5;
        const ry = look === "wide" ? 12 : look === "low" ? 7 : 10.5;
        const y = look === "low" ? cy + 4 : cy;
        return (
          <g key={side}>
            <ellipse cx={x} cy={y} rx={rx} ry={ry} fill={INK} />
            <circle cx={x + 2.5} cy={y - ry * 0.4} r={2.6} fill="white" opacity={0.9} />
          </g>
        );
      })}
    </g>
  );
}

/** Static geometric mascot (no tracking, no timers) for decorative spots. */
export function GeoMascot({
  shape = "circle",
  color = "var(--primary)",
  size = 64,
  look = "open",
  className = "",
}: {
  shape?: GeoShape;
  color?: string;
  size?: number;
  look?: EyeLook;
  className?: string;
}) {
  return (
    <svg viewBox="0 0 200 200" width={size} height={size} className={className} aria-hidden>
      <path d={SHAPES[shape].path} fill={color} />
      <Eyes shape={shape} look={look} blink={false} dx={0} dy={0} />
    </svg>
  );
}

/**
 * Minimal companion: a flat shape with eyes. It blinks, glances toward the pointer,
 * shows its mood through the eyes, and pulses softly with the voice while speaking.
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
  const [blink, setBlink] = useState(false);
  const [look, setLook] = useState({ x: 0, y: 0 });
  const [poked, setPoked] = useState(false);

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

  // Glance toward the pointer (eyes only, a few pixels).
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
        setLook({ x: Math.round(clamp(dx / 260) * 6), y: Math.round(clamp(dy / 260) * 4) });
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
      body.style.transform = `scale(${1 + v * 0.035}, ${1 - v * 0.02})`;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [state]);

  const eyeLook: EyeLook = poked ? "arc" : EYES_FOR[state];
  const gaze =
    state === "thinking"
      ? { x: 6, y: -6 }
      : state === "sleepy" || state === "sad"
        ? { x: 0, y: 2 }
        : look;

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
        <g
          key={state === "celebrate" ? "hop" : "rest"}
          className={state === "celebrate" ? "mascot-hop" : undefined}
        >
          <g ref={bodyRef} style={{ transformOrigin: "100px 166px", transformBox: "view-box" }}>
            <path d={SHAPES[spec.shape].path} fill={spec.color} />
            <Eyes
              shape={spec.shape}
              look={eyeLook}
              blink={blink && eyeLook !== "arc" && eyeLook !== "closed"}
              dx={gaze.x}
              dy={gaze.y}
            />
          </g>
        </g>
      </svg>
    </div>
  );
}
