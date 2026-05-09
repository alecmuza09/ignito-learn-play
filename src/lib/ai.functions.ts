import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { blockZ, ensureIds, type GenBlock, type MiniQuizBlock, type StyleSpec } from "./gen-blocks";

const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";
const MODEL = "google/gemini-3-flash-preview";
const IMAGE_MODEL = "google/gemini-3.1-flash-image-preview"; // Nano Banana 2
const IMAGE_MODEL_FALLBACK = "google/gemini-3-pro-image-preview";

async function callAI(
  messages: { role: string; content: string }[],
  jsonMode = false,
  modelOverride?: string,
  modalities?: string[],
): Promise<{ text: string; images: string[] }> {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("Falta LOVABLE_API_KEY");
  const body: Record<string, unknown> = { model: modelOverride ?? MODEL, messages };
  if (jsonMode) body.response_format = { type: "json_object" };
  if (modalities) (body as { modalities?: string[] }).modalities = modalities;
  const res = await fetch(GATEWAY_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const txt = await res.text();
    if (res.status === 429) throw new Error("Demasiadas solicitudes. Intenta en un momento.");
    if (res.status === 402) throw new Error("Sin créditos de IA. Agrega créditos en Workspace.");
    throw new Error(`AI error ${res.status}: ${txt.slice(0, 200)}`);
  }
  const data = await res.json();
  const msg = data.choices?.[0]?.message ?? {};
  const text: string = typeof msg.content === "string" ? msg.content : "";
  const images: string[] = extractImages(msg);
  return { text, images };
}

/** Extract image URLs from any of the shapes the gateway may return:
 *  - message.images[].image_url.url
 *  - message.images[].url
 *  - message.images[].b64_json  → wrap as data URL
 *  - message.content[] parts with type image_url / image / output_image
 */
function extractImages(msg: unknown): string[] {
  const out: string[] = [];
  const m = msg as {
    images?: Array<{ image_url?: { url?: string }; url?: string; b64_json?: string; mime_type?: string }>;
    content?: unknown;
  };
  if (Array.isArray(m.images)) {
    for (const im of m.images) {
      const url = im?.image_url?.url || im?.url;
      if (url) { out.push(url); continue; }
      if (im?.b64_json) { out.push(`data:${im.mime_type || "image/png"};base64,${im.b64_json}`); }
    }
  }
  if (Array.isArray(m.content)) {
    for (const part of m.content as Array<Record<string, unknown>>) {
      const t = part?.type as string | undefined;
      if (t === "image_url" || t === "image" || t === "output_image") {
        const u = (part as { image_url?: { url?: string }; url?: string }).image_url?.url
              ?? (part as { url?: string }).url;
        if (u) out.push(u);
        const b64 = (part as { b64_json?: string }).b64_json;
        const mime = (part as { mime_type?: string }).mime_type;
        if (!u && b64) out.push(`data:${mime || "image/png"};base64,${b64}`);
      }
    }
  }
  return out.filter(Boolean);
}

const lessonInput = z.object({
  lessonId: z.string(),
  subject: z.string(),
  topic: z.string().optional(),
  childName: z.string(),
  age: z.number(),
  level: z.string(),
  interests: z.array(z.string()),
  difficulty: z.number().min(1).max(4),
  language: z.string(),
  style: z.object({ format: z.string().optional(), focus: z.string().optional(), mode: z.string().optional() }).optional(),
});

export interface LessonShape {
  title: string;
  objective: string;
  blocks: GenBlock[];
  finalQuiz: MiniQuizBlock[];
  celebration: string;
  styleSpec?: StyleSpec;
}

export const generateLesson = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => lessonInput.parse(d))
  .handler(async ({ data }): Promise<{ lessonId: string; lesson: LessonShape }> => {
    const lang = data.language === "en" ? "English" : "Spanish";
    const focus = data.style?.focus ?? "";
    const format = data.style?.format ?? "";
    const mode = data.style?.mode ?? "";
    const targetCount = focus === "5" ? "4-5" : focus === "10" ? "5-7" : focus === "15" ? "7-9" : "8-10";
    const formatHint =
      format === "video"  ? "Lean heavily on hero/image/compare/steps blocks (very visual)."
      : format === "leer" ? "Lean on text(emphasis fact|analogy)/callout/steps blocks."
      : format === "jugar"? "Lean heavily on tryIt and miniQuiz blocks scattered through the lesson."
      : "Mix block types freely.";

    const sys = `You are IGNO, a playful, expert tutor on IGNOTO. Always reply in ${lang}, with energy and warmth. Use the child's interests as the metaphor backbone of every explanation. NEVER sound like a textbook — sound like a video-game cutscene. Emojis sparingly but joyfully. You output a Generative UI block tree the frontend renders.`;
    const prompt = `Compose ONE adaptive lesson as STRICT JSON (no markdown fences). The body is a list of typed UI blocks the frontend will render. Choose a composition that fits the topic and the child's preferred format. Vary it from a default template.

Shape:
{
  "title": string,
  "objective": string,
  "celebration": string,
  "styleSpec": { "palette": string, "illustrationStyle": string, "vibe": string },
  "blocks": GenBlock[],   // ${targetCount} blocks total (counting the hero)
  "finalQuiz": MiniQuizBlock[]  // exactly 4 questions
}

GenBlock union (pick the best for each beat — order matters, must start with a "hero"):
  { "type": "hero", "title": string, "subtitle": string, "imagePrompt": <english cartoon prompt no text> }
  { "type": "text", "body": string, "emphasis": "normal"|"fact"|"analogy" }
  { "type": "image", "imagePrompt": <english cartoon prompt no text>, "caption": string, "ratio": "16:9"|"4:3"|"1:1" }
  { "type": "compare", "left":  { "label": string, "imagePrompt": <english> },
                       "right": { "label": string, "imagePrompt": <english> },
                       "takeaway": string }
  { "type": "steps", "title": string, "items": [ { "icon": "1 emoji", "label": string, "body": string } ] (2-5 items) }
  { "type": "callout", "icon": "1 emoji", "title": string, "body": string }
  { "type": "mascotSays", "text": string, "mood": "happy"|"wink"|"wow"|"calm" }
  { "type": "tryIt", "question": string, "kind": "tap"|"sort"|"input",
      "payload": one of:
        { "kind": "tap",   "options": [string,string,string?,string?], "answerIndex": number, "explanation": string }
        { "kind": "sort",  "items": [string in CORRECT order], "explanation": string }
        { "kind": "input", "answer": string (short), "hint": string, "explanation": string } }
  { "type": "miniQuiz", "question": string, "options": [string,string,string?,string?], "answerIndex": number, "explanation": string }
  { "type": "simulation", "kind": "photosynthesis"|"waterCycle"|"fractionBar"|"logicPath"|"generic", "title": string, "caption": string, "steps": [string,string?,string?,string?] }

MiniQuizBlock = the same as the miniQuiz shape above.

Composition rules:
- ${formatHint}
- Density: ${targetCount} body blocks (excluding finalQuiz).
- Always include at least one of: compare OR steps OR tryIt — to break the monotony.
- Prefer a "simulation" block for visible processes, cycles, flows, systems, fractions or logic paths. Example: photosynthesis MUST use kind "photosynthesis" so the frontend renders an instant animated SVG instead of waiting for an AI image.
- Sprinkle exactly one mascotSays somewhere mid-lesson with a warm, in-character message.
- Every imagePrompt must be a vivid 1-sentence English cartoon prompt that mixes the concept with the child's favorite world. NO text inside images.
- Use the child's interests as the visual and verbal language.
- Difficulty ${data.difficulty}/4. Adjust vocabulary and depth.
- styleSpec: pick ONE consistent visual identity for the whole lesson (palette + illustrationStyle + a 3-5 word vibe). Every imagePrompt should match this identity so the lesson feels like a single illustrated book.

Child profile:
- Name: ${data.childName}
- Age: ${data.age}
- School level: ${data.level}
- Interests: ${data.interests.join(", ") || "general kid"}
- Subject: ${data.subject}
- Topic: ${data.topic ?? "(choose a great topic for this level)"}
- Learning mode: ${mode || "default"}

Return ONLY the JSON.`;
    const { text: raw } = await callAI([
      { role: "system", content: sys },
      { role: "user", content: prompt },
    ], true);
    let parsed: { title?: string; objective?: string; celebration?: string; styleSpec?: StyleSpec; blocks?: unknown; finalQuiz?: unknown };
    try { parsed = JSON.parse(raw); } catch {
      const m = raw.match(/\{[\s\S]*\}/);
      if (!m) throw new Error("La IA respondió en un formato inesperado.");
      parsed = JSON.parse(m[0]);
    }
    const rawBlocks = Array.isArray(parsed.blocks) ? (parsed.blocks as unknown[]) : [];
    const safeBlocks: GenBlock[] = [];
    for (const x of rawBlocks) {
      const r = blockZ.safeParse(x);
      if (r.success) safeBlocks.push(r.data);
    }
    const rawFinal = Array.isArray(parsed.finalQuiz) ? (parsed.finalQuiz as unknown[]) : [];
    const finalQuizBlocks: MiniQuizBlock[] = [];
    for (const x of rawFinal) {
      const withType = { ...(x as object), type: "miniQuiz" } as unknown;
      const r = blockZ.safeParse(withType);
      if (r.success && r.data.type === "miniQuiz") finalQuizBlocks.push(r.data);
    }
    const lesson: LessonShape = {
      title: String(parsed.title ?? "Misión IGNO"),
      objective: String(parsed.objective ?? ""),
      celebration: String(parsed.celebration ?? "¡Lo lograste!"),
      styleSpec: parsed.styleSpec && typeof parsed.styleSpec === "object" ? parsed.styleSpec : undefined,
      blocks: ensureIds(safeBlocks, "b"),
      finalQuiz: ensureIds(finalQuizBlocks, "fq") as MiniQuizBlock[],
    };
    return { lessonId: data.lessonId, lesson };
  });

const ignoInput = z.object({
  question: z.string().min(1).max(500),
  childName: z.string(),
  age: z.number(),
  interests: z.array(z.string()),
  lessonContext: z.string().optional(),
  language: z.string(),
});

export interface IgnoBlock {
  type: "text" | "image" | "example" | "tip" | "simulation";
  text?: string;
  imagePrompt?: string;
  caption?: string;
  icon?: string;
  title?: string;
  body?: string;
  kind?: "photosynthesis" | "waterCycle" | "fractionBar" | "logicPath" | "generic";
  steps?: string[];
}

export const askIgno = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => ignoInput.parse(d))
  .handler(async ({ data }) => {
    const lang = data.language === "en" ? "English" : "Spanish";
    const sys = `You are IGNO, a playful tutor for ${data.childName}, age ${data.age}. Reply in ${lang} with warmth and brevity. Always weave in their favorite world: ${data.interests.join(", ") || "general kid topics"}. You build RICH, multi-block answers — not walls of text. Be a friend who happens to be brilliant.`;
    const user = `${data.lessonContext ? `(Contexto de la lección: ${data.lessonContext})\n\n` : ""}Pregunta del niño: ${data.question}

Responde como STRICT JSON (sin markdown fences) con esta forma:
{
  "blocks": [
    { "type": "text", "text": string (1-3 frases cortas, puedes usar **negritas** y emojis) },
    // opcionales:
    { "type": "image", "imagePrompt": string (frase EN inglés para una ilustración cartoon kid-friendly que mezcle el concepto con el mundo favorito del niño; sin texto en la imagen), "caption": string (en ${lang}) },
    { "type": "example", "icon": string (1 emoji), "title": string (3-6 palabras), "body": string (1-2 frases con un ejemplo concreto del mundo del niño) },
    { "type": "tip", "icon": string (1 emoji), "text": string (un mini consejo accionable) }
  ]
}
Reglas: 2 a 4 bloques en total. SIEMPRE incluye al menos 1 "text". Incluye 1 "image" si ayuda visualmente (casi siempre que sea un concepto). Si das un ejemplo concreto, usa "example". Devuelve SOLO el JSON.`;
    const { text: raw } = await callAI([
      { role: "system", content: sys },
      { role: "user", content: user },
    ], true);
    let parsed: { blocks?: IgnoBlock[] };
    try { parsed = JSON.parse(raw); } catch {
      const m = raw.match(/\{[\s\S]*\}/);
      parsed = m ? JSON.parse(m[0]) : { blocks: [{ type: "text", text: raw }] };
    }
    const blocks: IgnoBlock[] = Array.isArray(parsed.blocks) && parsed.blocks.length
      ? parsed.blocks
      : [{ type: "text", text: raw }];
    return { blocks };
  });

const reportInput = z.object({
  childName: z.string(),
  xp: z.number(),
  streak: z.number(),
  completedCount: z.number(),
  subjects: z.array(z.object({ name: z.string(), difficulty: z.number() })),
  language: z.string(),
});

export const parentReport = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => reportInput.parse(d))
  .handler(async ({ data }) => {
    const lang = data.language === "en" ? "English" : "Spanish";
    const sys = `You are IGNO writing a warm weekly progress report for parents in ${lang}. Be specific, celebrate progress, and suggest 2 concrete next steps. ~150 words. Use friendly, professional tone.`;
    const prompt = `Child: ${data.childName}\nXP: ${data.xp}\nStreak: ${data.streak} days\nCompleted lessons: ${data.completedCount}\nSubjects & difficulty (1-4): ${data.subjects.map(s => `${s.name}=${s.difficulty}`).join(", ")}\n\nWrite the report in markdown.`;
    const { text: reply } = await callAI([
      { role: "system", content: sys },
      { role: "user", content: prompt },
    ]);
    return { report: reply };
  });

const imgInput = z.object({
  prompt: z.string().min(1).max(800),
  interests: z.array(z.string()).default([]),
  styleSpec: z.object({
    palette: z.string().optional(),
    illustrationStyle: z.string().optional(),
    vibe: z.string().optional(),
  }).optional(),
});

export const generateHeroImage = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => imgInput.parse(d))
  .handler(async ({ data }): Promise<{ url: string }> => {
    const interestsLine = data.interests.length ? ` Subtly weave in elements the child loves: ${data.interests.join(", ")}.` : "";
    const style = data.styleSpec;
    const styleLine = style
      ? ` Visual identity: ${style.illustrationStyle ?? "friendly cartoon"}, palette ${style.palette ?? "bright and cheerful"}, vibe ${style.vibe ?? "playful adventure"}.`
      : " Bold flat colors, soft shapes, cheerful lighting.";
    const fullPrompt = `Friendly children's-book illustration. ${data.prompt}${interestsLine}${styleLine} No text, no letters, no logos, wide 16:9 composition.`;

    const tryModel = async (model: string) => {
      const { images } = await callAI(
        [{ role: "user", content: fullPrompt }],
        false,
        model,
        ["image", "text"],
      );
      return images[0] ?? "";
    };

    let url = "";
    try { url = await tryModel(IMAGE_MODEL); } catch (e) {
      console.warn("[generateHeroImage] primary model failed:", (e as Error).message);
    }
    if (!url) {
      console.warn("[generateHeroImage] empty url from primary, trying fallback");
      try { url = await tryModel(IMAGE_MODEL_FALLBACK); } catch (e) {
        console.warn("[generateHeroImage] fallback failed:", (e as Error).message);
      }
    }
    if (!url) console.warn("[generateHeroImage] gateway returned no image for prompt:", data.prompt.slice(0, 80));
    return { url };
  });
