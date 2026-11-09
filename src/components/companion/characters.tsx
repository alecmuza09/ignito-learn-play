import type { CompanionId } from "@/lib/profile";

export type GeoShape = "circle" | "triangle" | "square" | "pentagon";

/** Flat geometric bodies on a 200×200 canvas, with where the eyes sit on each. */
export const SHAPES: Record<GeoShape, { path: string; eyes: [number, number]; eyeGap: number }> = {
  circle: {
    path: "M100 28a72 72 0 1 1 0 144a72 72 0 1 1 0-144Z",
    eyes: [100, 98],
    eyeGap: 26,
  },
  triangle: {
    path: "M88 36Q100 16 112 36L174 146Q184 166 162 166H38Q16 166 26 146Z",
    eyes: [100, 122],
    eyeGap: 22,
  },
  square: {
    path: "M60 34H140Q166 34 166 60V140Q166 166 140 166H60Q34 166 34 140V60Q34 34 60 34Z",
    eyes: [100, 96],
    eyeGap: 28,
  },
  pentagon: {
    path: "M88 30Q100 21 112 30L163 67Q175 76 170 90L151 150Q146 164 131 164H69Q54 164 49 150L30 90Q25 76 37 67Z",
    eyes: [100, 104],
    eyeGap: 25,
  },
};

/** How the eyes are drawn; each one gives the character a different temperament. */
export type EyeStyle = "googly" | "spark" | "dot" | "dreamy";
/** School item the character wears. */
export type Accessory = "cap" | "spark" | "glasses" | "beret";
/** Small idle habit, played every now and then. */
export type Quirk = "tilt" | "hop" | "brow" | "slowblink";

export interface CharacterSpec {
  id: CompanionId;
  name: string;
  tagline: { es: string; en: string };
  /** One line in the character's own voice, used in pickers and greetings. */
  line: { es: string; en: string };
  shape: GeoShape;
  color: string;
  cheek: string;
  eyes: EyeStyle;
  accessory: Accessory;
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
    color: "var(--pink)",
    cheek: "#e8457f",
    eyes: "googly",
    accessory: "cap",
    quirk: "tilt",
    voice: "Puck",
  },
  chispa: {
    id: "chispa",
    name: "Chispa",
    tagline: { es: "La que siempre levanta la mano", en: "Always raising her hand" },
    line: { es: "¡Ya sé, ya sé! ¿Otra más?", en: "I know, I know! Another one?" },
    shape: "triangle",
    color: "var(--lime)",
    cheek: "#ff8fb1",
    eyes: "spark",
    accessory: "spark",
    quirk: "hop",
    voice: "Fenrir",
  },
  bolt: {
    id: "bolt",
    name: "Bolt",
    tagline: { es: "El de los apuntes ordenados", en: "The one with tidy notes" },
    line: { es: "Vamos paso a paso. Primero lo primero.", en: "Step by step. First things first." },
    shape: "square",
    color: "var(--mint)",
    cheek: "#ff8fb1",
    eyes: "dot",
    accessory: "glasses",
    quirk: "brow",
    voice: "Charon",
  },
  luna: {
    id: "luna",
    name: "Luna",
    tagline: { es: "La que dibuja en los márgenes", en: "Doodles in the margins" },
    line: { es: "Imaginemos que es un cuento…", en: "Let's imagine it's a story…" },
    shape: "pentagon",
    color: "var(--sky)",
    cheek: "#ff8fb1",
    eyes: "dreamy",
    accessory: "beret",
    quirk: "slowblink",
    voice: "Aoede",
  },
};

export const CHARACTER_LIST = Object.values(CHARACTERS);

export const characterForShape = (shape: GeoShape) =>
  CHARACTER_LIST.find((c) => c.shape === shape) ?? CHARACTERS.igno;
