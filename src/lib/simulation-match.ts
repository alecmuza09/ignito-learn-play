import type { SimulationKind } from "./gen-blocks";

/**
 * Prebuilt animations draw fixed scenes (a heart, a volcano…). They are only worth
 * showing when the topic really is that scene, so matching is by whole-word prefixes
 * ("sol" must not match "solución") and ambiguous words are left out.
 */
const KIND_WORDS: Partial<Record<SimulationKind, string[]>> = {
  photosynthesis: ["fotosíntesis", "fotosintesis", "photosynth", "clorofila", "chlorophyll"],
  waterCycle: ["ciclo del agua", "water cycle", "evaporación", "evaporacion", "evaporation", "condensación", "precipitación"],
  weather: ["clima", "weather", "tormenta", "storm", "huracán", "huracan", "meteorolog"],
  seasons: ["estaciones del año", "seasons", "primavera", "otoño", "invierno"],
  phaseChange: ["estados de la materia", "states of matter", "sólido", "líquido", "solid", "liquid", "fusión", "ebullición", "evaporación"],
  fractionBar: ["fracción", "fracciones", "fraccion", "fraction", "numerador", "denominador"],
  multiplication: ["multiplicación", "multiplicacion", "multiplicar", "multiplication", "multiply", "tablas de multiplicar", "times table"],
  additionBlocks: ["suma", "sumas", "sumar", "resta", "restas", "restar", "addition", "subtraction"],
  geometry: ["geometría", "geometria", "geometry", "triángulo", "triangulo", "triangle", "polígono", "perímetro", "área de", "ángulo", "angle"],
  solarSystem: ["sistema solar", "solar system", "planeta", "planetas", "planet", "órbita", "orbit", "júpiter", "saturno", "marte", "mars"],
  rocket: ["cohete", "rocket", "astronauta", "astronaut", "despegue"],
  heart: ["corazón", "corazon", "heart", "circulación sanguínea", "sistema circulatorio", "circulatory"],
  respiration: ["pulmón", "pulmones", "lungs", "respiración", "respiracion", "respiratory", "breathing"],
  digestion: ["digestión", "digestion", "digestivo", "estómago", "stomach", "intestino"],
  atom: ["átomo", "atomo", "atom", "electrón", "electron", "protón", "proton", "neutrón", "neutron", "molécula"],
  dna: ["adn", "dna", "genética", "genetica", "genetics", "cromosoma", "chromosome"],
  circuit: ["circuito", "circuit", "electricidad", "electricity", "voltaje", "voltage", "corriente eléctrica"],
  magnet: ["imán", "imanes", "magnet", "magnetismo", "magnetism"],
  gravity: ["gravedad", "gravity", "gravitación"],
  pendulum: ["péndulo", "pendulo", "pendulum"],
  volcano: ["volcán", "volcan", "volcano", "magma", "erupción", "eruption"],
  wave: ["ondas", "onda sonora", "sound wave", "frecuencia", "frequency", "vibración"],
  musicNotes: ["notas musicales", "pentagrama", "music notes", "partitura"],
};

/**
 * These scenes carry their own fixed labels (eras, seasons, animals…), so they are
 * never drawn as-is: the frontend renders the model's own steps as a diagram.
 */
export const LABELLED_KINDS = new Set<SimulationKind>([
  "timeline", "lifeCycle", "foodChain", "ecosystem", "logicPath", "mapRoute", "alphabet", "seasons", "generic",
]);

function normalize(text: string) {
  return text.toLowerCase();
}

function hasWord(text: string, word: string) {
  const esc = word.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(^|[^\\p{L}])${esc}`, "u").test(text);
}

/** True when the prebuilt scene for `kind` really depicts what `text` is about. */
export function kindFits(kind: SimulationKind, text: string): boolean {
  if (LABELLED_KINDS.has(kind)) return false;
  const words = KIND_WORDS[kind];
  if (!words) return false;
  const t = normalize(text);
  return words.some((w) => hasWord(t, w));
}

/** Best prebuilt scene for a text, or null when none clearly fits. */
export function matchSimulationKind(text: string): SimulationKind | null {
  const t = normalize(text);
  let best: { kind: SimulationKind; score: number } | null = null;
  for (const [kind, words] of Object.entries(KIND_WORDS) as [SimulationKind, string[]][]) {
    if (LABELLED_KINDS.has(kind)) continue;
    const score = words.filter((w) => hasWord(t, w)).length;
    if (score && (!best || score > best.score)) best = { kind, score };
  }
  return best?.kind ?? null;
}

/** Diagram layout that suits a kind when its steps are drawn from content. */
export function diagramVariantFor(kind: SimulationKind): "timeline" | "cycle" | "flow" {
  if (kind === "timeline") return "timeline";
  if (kind === "lifeCycle" || kind === "seasons" || kind === "waterCycle") return "cycle";
  return "flow";
}
