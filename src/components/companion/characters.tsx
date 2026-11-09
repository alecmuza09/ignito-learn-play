import type { CompanionId } from "@/lib/profile";

export type GeoShape = "circle" | "triangle" | "square" | "pentagon";

/** Flat geometric bodies on a 200×200 canvas, with where the eyes sit on each. */
export const SHAPES: Record<GeoShape, { path: string; eyes: [number, number]; eyeGap: number }> = {
  circle: {
    path: "M100 28a72 72 0 1 1 0 144a72 72 0 1 1 0-144Z",
    eyes: [100, 96],
    eyeGap: 22,
  },
  triangle: {
    path: "M88 36Q100 16 112 36L174 146Q184 166 162 166H38Q16 166 26 146Z",
    eyes: [100, 122],
    eyeGap: 19,
  },
  square: {
    path: "M60 34H140Q166 34 166 60V140Q166 166 140 166H60Q34 166 34 140V60Q34 34 60 34Z",
    eyes: [100, 96],
    eyeGap: 22,
  },
  pentagon: {
    path: "M88 30Q100 21 112 30L163 67Q175 76 170 90L151 150Q146 164 131 164H69Q54 164 49 150L30 90Q25 76 37 67Z",
    eyes: [100, 104],
    eyeGap: 21,
  },
};

export interface CharacterSpec {
  id: CompanionId;
  name: string;
  tagline: { es: string; en: string };
  shape: GeoShape;
  color: string;
  /** Gemini TTS prebuilt voice. */
  voice: string;
}

export const CHARACTERS: Record<CompanionId, CharacterSpec> = {
  igno: {
    id: "igno",
    name: "Igno",
    tagline: { es: "Curioso y paciente", en: "Curious and patient" },
    shape: "circle",
    color: "var(--primary)",
    voice: "Puck",
  },
  chispa: {
    id: "chispa",
    name: "Chispa",
    tagline: { es: "Rápida y con energía", en: "Quick and energetic" },
    shape: "triangle",
    color: "var(--accent)",
    voice: "Fenrir",
  },
  bolt: {
    id: "bolt",
    name: "Bolt",
    tagline: { es: "Lógico y ordenado", en: "Logical and tidy" },
    shape: "square",
    color: "var(--mint)",
    voice: "Charon",
  },
  luna: {
    id: "luna",
    name: "Luna",
    tagline: { es: "Tranquila y creativa", en: "Calm and creative" },
    shape: "pentagon",
    color: "var(--sky)",
    voice: "Aoede",
  },
};

export const CHARACTER_LIST = Object.values(CHARACTERS);
