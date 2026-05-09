/**
 * Generative UI block schema. The AI emits a tree of these and the renderer
 * paints them. The agent mutates the same array live.
 */
import { z } from "zod";
import type { Tone } from "./theme-from-interests";

export type ImageRatio = "16:9" | "4:3" | "1:1";

export interface BlockBase { id: string; agentInserted?: boolean }

export type HeroBlock      = BlockBase & { type: "hero"; title: string; subtitle?: string; imagePrompt: string; tone?: Tone };
export type TextBlock      = BlockBase & { type: "text"; body: string; emphasis?: "normal" | "fact" | "analogy" };
export type ImageBlock     = BlockBase & { type: "image"; imagePrompt: string; caption?: string; ratio?: ImageRatio };
export type CompareBlock   = BlockBase & { type: "compare"; left: { label: string; imagePrompt: string }; right: { label: string; imagePrompt: string }; takeaway?: string };
export type StepsBlock     = BlockBase & { type: "steps"; title?: string; items: { icon?: string; label: string; body?: string }[] };
export type CalloutBlock   = BlockBase & { type: "callout"; icon?: string; title: string; body: string; tone?: Tone };
export type MascotSays     = BlockBase & { type: "mascotSays"; text: string; mood?: "happy" | "wink" | "wow" | "calm" };
export type TryItBlock     = BlockBase & {
  type: "tryIt";
  question: string;
  kind: "tap" | "sort" | "input";
  payload:
    | { kind: "tap";   options: string[]; answerIndex: number; explanation?: string }
    | { kind: "sort";  items: string[]; explanation?: string }
    | { kind: "input"; answer: string;   hint?: string; explanation?: string };
};
export type MiniQuizBlock  = BlockBase & { type: "miniQuiz"; question: string; options: string[]; answerIndex: number; explanation?: string };
export type CelebrateBlock = BlockBase & { type: "celebrate"; message: string; particles?: string[] };
export type SimulationKind =
  | "photosynthesis" | "waterCycle" | "fractionBar" | "logicPath"
  | "solarSystem" | "heart" | "atom" | "ecosystem" | "foodChain"
  | "circuit" | "magnet" | "gravity" | "dna" | "volcano"
  | "geometry" | "multiplication" | "alphabet" | "timeline"
  | "musicNotes" | "lifeCycle" | "weather" | "rocket" | "wave"
  | "generic";

export const SIMULATION_KINDS: SimulationKind[] = [
  "photosynthesis","waterCycle","fractionBar","logicPath",
  "solarSystem","heart","atom","ecosystem","foodChain",
  "circuit","magnet","gravity","dna","volcano",
  "geometry","multiplication","alphabet","timeline",
  "musicNotes","lifeCycle","weather","rocket","wave","generic",
];
export type SimulationBlock = BlockBase & {
  type: "simulation";
  kind: SimulationKind;
  title: string;
  caption?: string;
  steps?: string[];
};

export type GenBlock =
  | HeroBlock | TextBlock | ImageBlock | CompareBlock | StepsBlock
  | CalloutBlock | MascotSays | TryItBlock | MiniQuizBlock | CelebrateBlock | SimulationBlock;

/** Visual style the AI commits to for a whole lesson — used to keep
 *  every generated image in the same look, like the "Wizard Green"
 *  example from Google's generative UI paper. */
export interface StyleSpec {
  palette?: string;            // e.g. "vibrant carmine red and gold"
  illustrationStyle?: string;  // e.g. "Pixar-like 3D cartoon, soft shading"
  vibe?: string;               // e.g. "Marvel comic book hero adventure"
}

/** Actions the UI Agent can emit to mutate the live page. */
export type AgentAction =
  | { kind: "reaction"; payload: { tone: Tone; headline: string; message: string; particles: string[]; intensity: "calm" | "normal" | "epic"; ttlMs: number; reactionKind: "celebrate" | "encourage" | "hint" | "level-up" | "ambient" } }
  | { kind: "insertBlock"; at: "after-current" | "end"; block: GenBlock }
  | { kind: "switchTone"; tone: Tone };

/* ---------- Zod schemas (used to validate AI output) ---------- */

const toneZ = z.enum(["primary", "coral", "mint", "sky", "accent"]);

export const blockZ: z.ZodType<GenBlock> = z.lazy(() => z.discriminatedUnion("type", [
  z.object({ id: z.string().optional().default(""), agentInserted: z.boolean().optional(),
    type: z.literal("hero"), title: z.string(), subtitle: z.string().optional(),
    imagePrompt: z.string(), tone: toneZ.optional() }),
  z.object({ id: z.string().optional().default(""), agentInserted: z.boolean().optional(),
    type: z.literal("text"), body: z.string(), emphasis: z.enum(["normal","fact","analogy"]).optional() }),
  z.object({ id: z.string().optional().default(""), agentInserted: z.boolean().optional(),
    type: z.literal("image"), imagePrompt: z.string(), caption: z.string().optional(),
    ratio: z.enum(["16:9","4:3","1:1"]).optional() }),
  z.object({ id: z.string().optional().default(""), agentInserted: z.boolean().optional(),
    type: z.literal("compare"),
    left:  z.object({ label: z.string(), imagePrompt: z.string() }),
    right: z.object({ label: z.string(), imagePrompt: z.string() }),
    takeaway: z.string().optional() }),
  z.object({ id: z.string().optional().default(""), agentInserted: z.boolean().optional(),
    type: z.literal("steps"), title: z.string().optional(),
    items: z.array(z.object({ icon: z.string().optional(), label: z.string(), body: z.string().optional() })).min(2).max(8) }),
  z.object({ id: z.string().optional().default(""), agentInserted: z.boolean().optional(),
    type: z.literal("callout"), icon: z.string().optional(), title: z.string(),
    body: z.string(), tone: toneZ.optional() }),
  z.object({ id: z.string().optional().default(""), agentInserted: z.boolean().optional(),
    type: z.literal("mascotSays"), text: z.string(),
    mood: z.enum(["happy","wink","wow","calm"]).optional() }),
  z.object({ id: z.string().optional().default(""), agentInserted: z.boolean().optional(),
    type: z.literal("tryIt"), question: z.string(),
    kind: z.enum(["tap","sort","input"]),
    payload: z.union([
      z.object({ kind: z.literal("tap"),   options: z.array(z.string()).min(2).max(4), answerIndex: z.number(), explanation: z.string().optional() }),
      z.object({ kind: z.literal("sort"),  items: z.array(z.string()).min(2).max(5), explanation: z.string().optional() }),
      z.object({ kind: z.literal("input"), answer: z.string(), hint: z.string().optional(), explanation: z.string().optional() }),
    ]) }),
  z.object({ id: z.string().optional().default(""), agentInserted: z.boolean().optional(),
    type: z.literal("miniQuiz"), question: z.string(),
    options: z.array(z.string()).min(2).max(4),
    answerIndex: z.number(), explanation: z.string().optional() }),
  z.object({ id: z.string().optional().default(""), agentInserted: z.boolean().optional(),
    type: z.literal("celebrate"), message: z.string(),
    particles: z.array(z.string()).optional() }),
  z.object({ id: z.string().optional().default(""), agentInserted: z.boolean().optional(),
    type: z.literal("simulation"),
    kind: z.enum([
      "photosynthesis","waterCycle","fractionBar","logicPath",
      "solarSystem","heart","atom","ecosystem","foodChain",
      "circuit","magnet","gravity","dna","volcano",
      "geometry","multiplication","alphabet","timeline",
      "musicNotes","lifeCycle","weather","rocket","wave","generic",
    ]),
    title: z.string(), caption: z.string().optional(), steps: z.array(z.string()).min(1).max(6).optional() }),
])) as z.ZodType<GenBlock>;

/** Assign stable ids to a block list (id-less blocks get one). */
export function ensureIds(blocks: GenBlock[], prefix = "b"): GenBlock[] {
  return blocks.map((b, i) => ({ ...b, id: b.id && b.id.length ? b.id : `${prefix}-${i}-${Math.random().toString(36).slice(2,7)}` }));
}

export function newId(prefix = "ag") {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,6)}`;
}