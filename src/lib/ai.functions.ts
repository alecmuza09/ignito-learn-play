import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { blockZ, ensureIds, type GenBlock, type MiniQuizBlock, type StyleSpec } from "./gen-blocks";
import { IMAGE_MODELS, TEXT_MODELS, geminiGenerate } from "./gemini-models";
import { diagramVariantFor, kindFits } from "./simulation-match";

const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";
const MODEL = "google/gemini-3-flash-preview";
const IMAGE_MODEL = "google/gemini-3.1-flash-image-preview"; // Nano Banana 2
const IMAGE_MODEL_FALLBACK = "google/gemini-3-pro-image-preview";


/** Call Google Gemini directly using the user-supplied GEMINI_API_KEY.
 *  Used for both text (JSON) and image generation, bypassing the Lovable gateway. */
async function callGemini(
  models: string[],
  contents: unknown,
  opts: { json?: boolean; image?: boolean; aspectRatio?: string; timeoutMs?: number; system?: string } = {},
): Promise<{ text: string; images: string[] }> {
  const body: Record<string, unknown> = { contents };
  if (opts.system) body.systemInstruction = { role: "system", parts: [{ text: opts.system }] };
  const generationConfig: Record<string, unknown> = {};
  if (opts.json) generationConfig.responseMimeType = "application/json";
  if (opts.image) generationConfig.responseModalities = ["IMAGE", "TEXT"];
  if (opts.image && opts.aspectRatio) generationConfig.imageConfig = { aspectRatio: opts.aspectRatio };
  if (Object.keys(generationConfig).length) body.generationConfig = generationConfig;

  const signal = opts.timeoutMs ? AbortSignal.timeout(opts.timeoutMs) : undefined;
  const data = (await geminiGenerate(models, body, { signal })) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string; inlineData?: { data?: string; mimeType?: string; mime_type?: string }; inline_data?: { data?: string; mimeType?: string; mime_type?: string } }> } }>;
  };
  const parts = data?.candidates?.[0]?.content?.parts ?? [];
  let text = "";
  const images: string[] = [];
  for (const p of parts) {
    if (typeof p?.text === "string") text += p.text;
    const inline = p?.inlineData ?? p?.inline_data;
    if (inline?.data) images.push(`data:${inline.mimeType ?? inline.mime_type ?? "image/png"};base64,${inline.data}`);
  }
  return { text, images };
}

async function callAI(
  messages: { role: string; content: string }[],
  jsonMode = false,
  modelOverride?: string,
  modalities?: string[],
  timeoutMs?: number,
): Promise<{ text: string; images: string[] }> {
  // Prefer the user-supplied Gemini API key (no Lovable credits required).
  if (process.env.GEMINI_API_KEY && !modalities) {
    const sysParts = messages.filter((m) => m.role === "system").map((m) => m.content).join("\n\n");
    const userParts = messages.filter((m) => m.role !== "system");
    const contents = userParts.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));
    return await callGemini(TEXT_MODELS, contents, { json: jsonMode, system: sysParts || undefined, timeoutMs });
  }
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("Falta GEMINI_API_KEY o LOVABLE_API_KEY");
  const body: Record<string, unknown> = { model: modelOverride ?? MODEL, messages };
  if (jsonMode) body.response_format = { type: "json_object" };
  if (modalities) (body as { modalities?: string[] }).modalities = modalities;
  const controller = timeoutMs ? new AbortController() : undefined;
  const timeout = timeoutMs ? setTimeout(() => controller?.abort(), timeoutMs) : undefined;
  const res = await fetch(GATEWAY_URL, {
    method: "POST",
    signal: controller?.signal,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify(body),
  }).finally(() => { if (timeout) clearTimeout(timeout); });
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
  audience: z.enum(["kids", "adult"]).default("kids"),
});

const ADULT_OVERRIDE = `\n\nIMPORTANT OVERRIDE: the learner is an ADULT. Ignore any instruction to sound childish. Be an expert mentor: precise, respectful, practical, with real-world applications and professional examples. Use their interests as context, not as cartoon metaphors. imagePrompts must be clean modern editorial illustrations (not children's-book style). Keep the same JSON shape.`;

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

    const sys = `You are IGNO, a playful, expert tutor on IGNOTO. Always reply in ${lang}, with energy and warmth. Use the child's interests as the metaphor backbone of every explanation. NEVER sound like a textbook — sound like a video-game cutscene. Never use emojis. You output a Generative UI block tree the frontend renders.${data.audience === "adult" ? ADULT_OVERRIDE : ""}`;
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
  { "type": "steps", "title": string, "items": [ { "label": string, "body": string } ] (2-5 items) }
  { "type": "callout", "title": string, "body": string }
  { "type": "mascotSays", "text": string, "mood": "happy"|"wink"|"wow"|"calm" }
  { "type": "tryIt", "question": string, "kind": "tap"|"sort"|"input",
      "payload": one of:
        { "kind": "tap",   "options": [string,string,string?,string?], "answerIndex": number, "explanation": string }
        { "kind": "sort",  "items": [string in CORRECT order], "explanation": string }
        { "kind": "input", "answer": string (short), "hint": string, "explanation": string } }
  { "type": "miniQuiz", "question": string, "options": [string,string,string?,string?], "answerIndex": number, "explanation": string }
  { "type": "diagram", "variant": "timeline"|"cycle"|"flow"|"compare", "title": string, "caption": string,
      "items": [ { "label": string (max 6 words), "detail": string (max 18 words) } ] (3-6 items, for timeline/cycle/flow),
      "columns": [ { "title": string, "points": [string] } ] (2-3 columns, only for compare) }
  { "type": "simulation", "kind": "photosynthesis"|"waterCycle"|"fractionBar"|"solarSystem"|"heart"|"atom"|"circuit"|"magnet"|"gravity"|"dna"|"volcano"|"geometry"|"multiplication"|"weather"|"rocket"|"wave"|"digestion"|"respiration"|"phaseChange"|"pendulum"|"additionBlocks"|"musicNotes", "title": string, "caption": string, "steps": [string,string?,string?,string?] }

MiniQuizBlock = the same as the miniQuiz shape above.

Composition rules:
- ${formatHint}
- Density: ${targetCount} body blocks (excluding finalQuiz).
- Always include at least one of: compare OR steps OR tryIt — to break the monotony.
- Include exactly one "diagram" built from THIS lesson's real content: "timeline" for events in order (use real dates/periods of the topic), "cycle" for processes that repeat, "flow" for cause→effect or steps, "compare" for differences. Every label must be specific to the topic — never generic words like "Inicio", "Era", "Paso 1".
- Use a "simulation" ONLY when its prebuilt scene literally depicts the concept (e.g. "heart" for how the heart pumps blood, "volcano" for an eruption, "solarSystem" for the planets). If no kind is an exact match, do NOT add a simulation.
- Accuracy first: every fact, date, number and definition must be correct for the level. Do not invent facts. Analogies with the child's interests must not change the facts.
- Quizzes: answerIndex must point to the single correct option, distractors must be clearly wrong, and the explanation must justify that answer.
- Sprinkle exactly one mascotSays somewhere mid-lesson with a warm, in-character message.
- Every imagePrompt (English, max 35 words) describes ONE concrete, accurate scene of the lesson concept: the exact object, place or action, what it looks like, viewpoint. No text in images. Do NOT mix in characters from the child's interests (that makes images confusing).
- The HERO imagePrompt is the lesson cover: the clearest single image of the topic; it may include ONE small element of the child's favorite world (${data.interests.join(", ") || "none"}) as a secondary detail.
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
    const checked = sanitizeBlocks(safeBlocks, `${parsed.title ?? ""} ${data.topic ?? ""} ${data.subject}`);
    safeBlocks.length = 0;
    safeBlocks.push(...checked);
    const rawFinal = Array.isArray(parsed.finalQuiz) ? (parsed.finalQuiz as unknown[]) : [];
    const finalQuizBlocks: MiniQuizBlock[] = [];
    for (const x of rawFinal) {
      const withType = { ...(x as object), type: "miniQuiz" } as unknown;
      const r = blockZ.safeParse(withType);
      if (r.success && r.data.type === "miniQuiz" && validQuiz(r.data.options, r.data.answerIndex)) finalQuizBlocks.push(r.data);
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
  kind?: import("./gen-blocks").SimulationKind;
  steps?: string[];
}

export const askIgno = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => ignoInput.parse(d))
  .handler(async ({ data }) => {
    const lang = data.language === "en" ? "English" : "Spanish";
    const sys = `You are IGNO, a playful tutor for ${data.childName}, age ${data.age}. Reply in ${lang} with warmth and brevity. Always weave in their favorite world: ${data.interests.join(", ") || "general kid topics"}. You build RICH, multi-block answers — not walls of text. Be a friend who happens to be brilliant. Never use emojis.`;
    const user = `${data.lessonContext ? `(Contexto de la lección: ${data.lessonContext})\n\n` : ""}Pregunta del niño: ${data.question}

Responde como STRICT JSON (sin markdown fences) con esta forma:
{
  "blocks": [
    { "type": "text", "text": string (1-3 frases cortas, puedes usar **negritas**; NO uses emojis) },
    // opcionales:
    { "type": "image", "imagePrompt": string (frase EN inglés para una ilustración cartoon kid-friendly que mezcle el concepto con el mundo favorito del niño; sin texto en la imagen), "caption": string (en ${lang}) },
    { "type": "simulation", "kind": "photosynthesis"|"waterCycle"|"fractionBar"|"logicPath"|"solarSystem"|"heart"|"atom"|"ecosystem"|"foodChain"|"circuit"|"magnet"|"gravity"|"dna"|"volcano"|"geometry"|"multiplication"|"alphabet"|"timeline"|"musicNotes"|"lifeCycle"|"weather"|"rocket"|"wave"|"digestion"|"respiration"|"seasons"|"phaseChange"|"pendulum"|"additionBlocks"|"mapRoute"|"generic", "title": string, "caption": string, "steps": [string,string?,string?,string?] },
    { "type": "example", "title": string (3-6 palabras), "body": string (1-2 frases con un ejemplo concreto del mundo del niño) },
    { "type": "tip", "text": string (un mini consejo accionable) }
  ]
}
Reglas: 2 a 4 bloques en total. SIEMPRE incluye 1 "text" con datos correctos. Incluye "simulation" SOLO si ese kind dibuja literalmente el concepto; si no, no la incluyas. El "title" y "caption" deben ser muy breves (máx 6 palabras cada uno). Si das un ejemplo concreto, usa "example". Devuelve SOLO el JSON.`;
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
    const sys = `You are IGNO writing a warm weekly progress report for parents in ${lang}. Be specific, celebrate progress, and suggest 2 concrete next steps. ~150 words. Use friendly, professional tone. Plain text, no emojis, no markdown headings.`;
    const prompt = `Child: ${data.childName}\nXP: ${data.xp}\nStreak: ${data.streak} days\nCompleted lessons: ${data.completedCount}\nSubjects & difficulty (1-4): ${data.subjects.map(s => `${s.name}=${s.difficulty}`).join(", ")}\n\nWrite the report in markdown.`;
    const { text: reply } = await callAI([
      { role: "system", content: sys },
      { role: "user", content: prompt },
    ]);
    return { report: reply };
  });

/** A quiz is usable only if the answer points at one of its distinct options. */
function validQuiz(options: string[], answerIndex: number) {
  const norm = options.map((o) => o.trim().toLowerCase());
  return Number.isInteger(answerIndex) && answerIndex >= 0 && answerIndex < options.length && new Set(norm).size === norm.length && norm.every(Boolean);
}

/**
 * Drops quizzes with a broken answer key and replaces prebuilt scenes that don't
 * depict the topic with a diagram of the model's own steps (or removes them).
 */
function sanitizeBlocks(blocks: GenBlock[], topic: string): GenBlock[] {
  const out: GenBlock[] = [];
  for (const b of blocks) {
    if (b.type === "miniQuiz" && !validQuiz(b.options, b.answerIndex)) continue;
    if (b.type === "tryIt" && b.payload.kind === "tap" && !validQuiz(b.payload.options, b.payload.answerIndex)) continue;
    if (b.type === "simulation") {
      const text = `${topic} ${b.title} ${b.caption ?? ""} ${(b.steps ?? []).join(" ")}`;
      if (!kindFits(b.kind, text)) {
        if (b.steps && b.steps.length >= 2) {
          out.push({ id: b.id, type: "diagram", variant: diagramVariantFor(b.kind), title: b.title, caption: b.caption, items: b.steps.map((label) => ({ label })) });
        }
        continue;
      }
    }
    if (b.type === "diagram" && (b.variant === "compare" ? !(b.columns && b.columns.length >= 2) : !(b.items && b.items.length >= 2))) continue;
    out.push(b);
  }
  return out;
}

const imgInput = z.object({
  prompt: z.string().min(1).max(800),
  /** What the picture must make obvious (its caption or label). */
  focus: z.string().max(200).optional(),
  /** Lesson title, to keep every picture on topic. */
  topic: z.string().max(200).optional(),
  ratio: z.enum(["16:9", "4:3", "1:1"]).default("16:9"),
  hero: z.boolean().optional(),
  age: z.number().optional(),
  interests: z.array(z.string()).default([]),
  styleSpec: z.object({
    palette: z.string().optional(),
    illustrationStyle: z.string().optional(),
    vibe: z.string().optional(),
  }).optional(),
});

/**
 * Image prompts that stay on the concept: one clear subject, accurate, uncluttered.
 * The child's interest is only allowed on the cover, and only as a secondary element.
 */
function buildImagePrompt(data: z.infer<typeof imgInput>) {
  const style = data.styleSpec;
  const audience = data.age && data.age >= 16 ? "adult learners" : `children around ${data.age ?? 9} years old`;
  const lines = [
    `Educational illustration for ${audience}.`,
    `Main subject: ${data.prompt.trim()}`,
    data.focus ? `The image must make this idea obvious at a glance: "${data.focus}".` : "",
    data.topic ? `Lesson topic: "${data.topic}". Everything shown must be accurate for this topic.` : "",
    "Composition: ONE clear main subject, large, centered and fully visible; at most two supporting elements; simple, plain background; no crowds, no busy scenery, no decorative clutter.",
    "Accuracy: correct shapes, proportions, colors and counts for the real-world subject; do not invent parts.",
    data.hero && data.interests[0]
      ? `A small, secondary nod to ${data.interests[0]} is allowed only if it does not distract from the subject.`
      : "Do not add characters or themes unrelated to the subject.",
    style
      ? `Style: ${style.illustrationStyle ?? "clean flat illustration"}, palette ${style.palette ?? "bright, friendly"}.`
      : "Style: clean flat illustration, soft shading, bright friendly palette, clear outlines.",
    `Aspect ratio ${data.ratio}.`,
    "Absolutely no text, letters, numbers, labels, captions, logos or watermarks.",
  ];
  return lines.filter(Boolean).join(" ");
}

export const generateHeroImage = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => imgInput.parse(d))
  .handler(async ({ data }): Promise<{ url: string }> => {
    const fullPrompt = buildImagePrompt(data);

    // Prefer direct Gemini call when the user-provided key is set (no Lovable credits required).
    if (process.env.GEMINI_API_KEY) {
      try {
        const { images } = await callGemini(
          IMAGE_MODELS,
          [{ role: "user", parts: [{ text: fullPrompt }] }],
          { image: true, aspectRatio: data.ratio, timeoutMs: 40000 },
        );
        if (images[0]) return { url: images[0] };
      } catch (e) {
        console.warn("[generateHeroImage] direct Gemini failed:", (e as Error).message);
      }
    }

    const tryModel = async (model: string) => {
      const { images } = await callAI(
        [{ role: "user", content: fullPrompt }],
        false,
        model,
        ["image", "text"],
        18000,
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
