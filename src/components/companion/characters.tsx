import type { CompanionId } from "@/lib/profile";

export type GeoShape = "circle" | "triangle" | "square" | "cloud";

/**
 * Soft, flat bodies on a 200×200 canvas (bottom edge near y=174), with where the
 * eyes sit on each. Slightly irregular on purpose so they read as characters.
 */
export const SHAPES: Record<GeoShape, { path: string; eyes: [number, number] }> = {
  // Gumdrop: round top, settled bottom.
  circle: {
    path: "M100 30C146 30 178 68 178 116C178 156 150 174 100 174C50 174 22 156 22 116C22 68 54 30 100 30Z",
    eyes: [100, 102],
  },
  // Soft triangle leaning right.
  triangle: {
    path: "M114 26C126 22 136 30 142 42L182 138C190 160 178 176 152 176H50C24 176 12 158 24 136L94 36C99 30 106 27 114 26Z",
    eyes: [112, 120],
  },
  // Squircle.
  square: {
    path: "M64 34H136C160 34 172 46 172 70V138C172 162 160 174 136 174H64C40 174 28 162 28 138V70C28 46 40 34 64 34Z",
    eyes: [100, 100],
  },
  // Cloud.
  cloud: {
    path: "M58 174C30 174 16 154 22 132C27 114 40 104 54 104C52 76 72 56 98 56C118 56 134 68 140 86C164 84 182 104 182 130C182 156 162 174 136 174Z",
    eyes: [106, 126],
  },
};

/** Pill eyes: size, spacing and a tilt (both eyes lean the same way) set the temperament. */
export interface EyeSpec {
  w: number;
  h: number;
  gap: number;
  tilt: number;
}

/** Small idle habit, played every now and then. */
export type Quirk = "tilt" | "hop" | "squash" | "sway";

export interface CharacterSpec {
  id: CompanionId;
  name: string;
  tagline: { es: string; en: string };
  /** One line in the character's own voice, used in pickers and greetings. */
  line: { es: string; en: string };
  shape: GeoShape;
  color: string;
  eyes: EyeSpec;
  quirk: Quirk;
  /** Gemini TTS prebuilt voice. */
  voice: string;
}

export const CHARACTERS: Record<CompanionId, CharacterSpec> = {
  igno: {
    id: "igno",
    name: "Igno",
    tagline: { es: "El curioso de la clase", en: "The curious one" },
    line: { es: "¿Y eso por qué pasa? ¡Averigüémoslo!", en: "Why does that happen? Let's find out!" },
    shape: "circle",
    color: "#ff4fa0",
    eyes: { w: 15, h: 30, gap: 21, tilt: 0 },
    quirk: "tilt",
    voice: "Puck",
  },
  chispa: {
    id: "chispa",
    name: "Chispa",
    tagline: { es: "La que siempre levanta la mano", en: "Always raising her hand" },
    line: { es: "¡Ya sé, ya sé! ¿Otra más?", en: "I know, I know! Another one?" },
    shape: "triangle",
    color: "#ff9a1f",
    eyes: { w: 12, h: 25, gap: 16, tilt: 6 },
    quirk: "hop",
    voice: "Fenrir",
  },
  bolt: {
    id: "bolt",
    name: "Bolt",
    tagline: { es: "El de los apuntes ordenados", en: "The one with tidy notes" },
    line: { es: "Vamos paso a paso. Primero lo primero.", en: "Step by step. First things first." },
    shape: "square",
    color: "#12b39a",
    eyes: { w: 13, h: 27, gap: 19, tilt: -22 },
    quirk: "squash",
    voice: "Charon",
  },
  luna: {
    id: "luna",
    name: "Luna",
    tagline: { es: "La que dibuja en los márgenes", en: "Doodles in the margins" },
    line: { es: "Imaginemos que es un cuento…", en: "Let's imagine it's a story…" },
    shape: "cloud",
    color: "#2f83ff",
    eyes: { w: 14, h: 20, gap: 20, tilt: 10 },
    quirk: "sway",
    voice: "Aoede",
  },
};

export const CHARACTER_LIST = Object.values(CHARACTERS);

export const characterForShape = (shape: GeoShape) =>
  CHARACTER_LIST.find((c) => c.shape === shape) ?? CHARACTERS.igno;
