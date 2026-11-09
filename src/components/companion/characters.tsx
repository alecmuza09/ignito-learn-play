import type { ReactNode } from "react";
import type { CompanionId } from "@/lib/profile";

export interface CharacterSpec {
  id: CompanionId;
  name: string;
  tagline: { es: string; en: string };
  /** Body fill and the darker rim used for depth. */
  body: string;
  rim: string;
  cheek: string;
  /** Gemini TTS prebuilt voice. */
  voice: string;
  bodyPath: string;
  eyes: { l: [number, number]; r: [number, number]; spread: number };
  mouth: [number, number];
  /** Rendered behind the body (ears, tail…). `t` is seconds, `energy` 0..1 grows with excitement. */
  back?: (t: number, energy: number) => ReactNode;
  /** Rendered in front of the body (sprouts, antennae, flame tips…). */
  front?: (t: number, energy: number) => ReactNode;
}

const wave = (t: number, speed: number, amp: number, phase = 0) =>
  Math.sin(t * speed + phase) * amp;

export const CHARACTERS: Record<CompanionId, CharacterSpec> = {
  igno: {
    id: "igno",
    name: "Igno",
    tagline: { es: "Curioso y chispeante", en: "Curious and sparky" },
    body: "oklch(0.66 0.19 295)",
    rim: "oklch(0.52 0.19 295)",
    cheek: "oklch(0.80 0.12 0 / 0.75)",
    voice: "Puck",
    bodyPath:
      "M100 40 C146 40 168 74 168 112 C168 152 140 172 100 172 C60 172 32 152 32 112 C32 74 54 40 100 40 Z",
    eyes: { l: [80, 102], r: [120, 102], spread: 40 },
    mouth: [100, 128],
    front: (t, e) => {
      const sway = wave(t, 2.2, 6 + e * 8);
      return (
        <g transform={`rotate(${sway} 100 44)`}>
          <path
            d="M100 46 C98 34 92 26 84 22 C94 22 103 28 105 38 C108 30 114 26 121 26 C113 32 108 40 104 47 Z"
            fill="oklch(0.80 0.15 140)"
          />
          <circle
            cx={100}
            cy={22 + wave(t, 3, 1.5)}
            r={5 + e * 2}
            fill="oklch(0.88 0.16 85)"
            opacity={0.9}
          />
        </g>
      );
    },
  },
  chispa: {
    id: "chispa",
    name: "Chispa",
    tagline: { es: "Energía pura de fuego", en: "Pure fire energy" },
    body: "oklch(0.76 0.17 50)",
    rim: "oklch(0.64 0.19 40)",
    cheek: "oklch(0.72 0.17 20 / 0.7)",
    voice: "Fenrir",
    bodyPath:
      "M100 30 C114 52 132 56 150 84 C170 114 162 172 100 172 C38 172 30 114 50 84 C62 66 78 66 84 46 C92 56 96 44 100 30 Z",
    eyes: { l: [82, 112], r: [118, 112], spread: 36 },
    mouth: [100, 136],
    front: (t, e) => {
      const f = (p: number) => 8 + wave(t, 9, 3 + e * 4, p);
      return (
        <g opacity={0.95}>
          <path
            d={`M100 ${34 - f(0)} C108 48 116 54 112 66 C106 58 100 58 96 66 C90 56 94 46 100 ${34 - f(0)} Z`}
            fill="oklch(0.88 0.16 85)"
          />
          <circle
            cx={62 + wave(t, 4, 3)}
            cy={58 - ((t * 30) % 40)}
            r={2.5}
            fill="oklch(0.88 0.16 85)"
            opacity={1 - ((t * 30) % 40) / 40}
          />
          <circle
            cx={140 + wave(t, 5, 3, 1)}
            cy={66 - ((t * 24 + 20) % 40)}
            r={2}
            fill="oklch(0.88 0.16 85)"
            opacity={1 - ((t * 24 + 20) % 40) / 40}
          />
        </g>
      );
    },
  },
  bolt: {
    id: "bolt",
    name: "Bolt",
    tagline: { es: "Robot lógico y amable", en: "Logical, friendly robot" },
    body: "oklch(0.80 0.11 175)",
    rim: "oklch(0.64 0.11 180)",
    cheek: "oklch(0.78 0.12 20 / 0.55)",
    voice: "Charon",
    bodyPath:
      "M58 52 H142 Q166 52 166 76 V146 Q166 170 142 170 H58 Q34 170 34 146 V76 Q34 52 58 52 Z",
    eyes: { l: [80, 104], r: [120, 104], spread: 40 },
    mouth: [100, 134],
    back: (t) => (
      <g>
        <rect
          x={22}
          y={92 + wave(t, 2, 1)}
          width={14}
          height={30}
          rx={6}
          fill="oklch(0.64 0.11 180)"
        />
        <rect
          x={164}
          y={92 - wave(t, 2, 1)}
          width={14}
          height={30}
          rx={6}
          fill="oklch(0.64 0.11 180)"
        />
      </g>
    ),
    front: (t, e) => (
      <g>
        <rect x={52} y={78} width={96} height={72} rx={18} fill="oklch(0.30 0.05 230 / 0.16)" />
        <line
          x1={100}
          y1={52}
          x2={100 + wave(t, 2.6, 3)}
          y2={30}
          stroke="oklch(0.64 0.11 180)"
          strokeWidth={4}
          strokeLinecap="round"
        />
        <circle
          cx={100 + wave(t, 2.6, 3)}
          cy={26}
          r={6 + e * 2}
          fill={e > 0.4 ? "oklch(0.88 0.16 85)" : "oklch(0.75 0.17 25)"}
          opacity={0.6 + 0.4 * Math.abs(Math.sin(t * 3))}
        />
      </g>
    ),
  },
  luna: {
    id: "luna",
    name: "Luna",
    tagline: { es: "Soñadora de las estrellas", en: "Stargazing dreamer" },
    body: "oklch(0.80 0.09 245)",
    rim: "oklch(0.66 0.11 250)",
    cheek: "oklch(0.80 0.11 0 / 0.7)",
    voice: "Aoede",
    bodyPath:
      "M100 48 C148 48 166 82 166 116 C166 152 138 172 100 172 C62 172 34 152 34 116 C34 82 52 48 100 48 Z",
    eyes: { l: [80, 108], r: [120, 108], spread: 40 },
    mouth: [100, 134],
    back: (t, e) => {
      const tw = wave(t, 1.6, 4 + e * 6);
      return (
        <g>
          <path d={`M52 74 L46 ${30 - tw} L82 56 Z`} fill="oklch(0.66 0.11 250)" />
          <path d={`M148 74 L154 ${30 + tw} L118 56 Z`} fill="oklch(0.66 0.11 250)" />
        </g>
      );
    },
    front: (t) => {
      const r = (t * 40) % 360;
      return (
        <g transform={`translate(146 60) rotate(${r})`}>
          <path
            d="M0 -9 L2.6 -2.6 L9 0 L2.6 2.6 L0 9 L-2.6 2.6 L-9 0 L-2.6 -2.6 Z"
            fill="oklch(0.90 0.14 90)"
          />
        </g>
      );
    },
  },
};

export const CHARACTER_LIST = Object.values(CHARACTERS);
