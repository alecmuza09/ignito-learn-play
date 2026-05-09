import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";
const MODEL = "google/gemini-3-flash-preview";
const IMAGE_MODEL = "google/gemini-2.5-flash-image";

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
  const images: string[] = Array.isArray(msg.images)
    ? msg.images.map((im: { image_url?: { url?: string } }) => im?.image_url?.url ?? "").filter(Boolean)
    : [];
  return { text, images };
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
});

export interface LessonShape {
  title: string;
  objective: string;
  story: string;
  heroImagePrompt: string;
  sections: { kind: string; title: string; body: string; imagePrompt: string }[];
  quiz: { type: string; question: string; options: string[]; answerIndex: number; explanation: string }[];
  celebration: string;
}

export const generateLesson = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => lessonInput.parse(d))
  .handler(async ({ data }): Promise<{ lessonId: string; lesson: LessonShape }> => {
    const lang = data.language === "en" ? "English" : "Spanish";
    const sys = `You are IGNO, a playful, expert tutor for kids on the IGNOTO platform. Always reply in ${lang}, with energy and warmth. Use the child's interests as the metaphor backbone of every explanation. NEVER sound like a textbook. Sound like a video-game cutscene. Use emojis sparingly but joyfully.`;
    const prompt = `Create ONE adaptive lesson as STRICT JSON (no markdown fences) with this shape:
{
 "title": string (catchy, age-appropriate),
 "objective": string (1 sentence learning goal),
 "story": string (2-4 sentence story hook connecting the topic to the child's interests),
 "heroImagePrompt": string (vivid English prompt, 1-2 sentences, for a colorful kid-friendly cartoon illustration that mixes the topic with the child's interests; no text in image),
 "sections": [ { "kind": "explanation"|"funFact"|"analogy"|"miniChallenge", "title": string, "body": string, "imagePrompt": string } ] (3 to 5 items, mixed kinds; imagePrompt is a 1-sentence English prompt for a kid-friendly cartoon illustration that VISUALIZES this section's concept blended with the child's favorite world; no text in image),
 "quiz": [ { "type": "multiple"|"truefalse", "question": string, "options": string[], "answerIndex": number, "explanation": string } ] (exactly 5 items),
 "celebration": string (1 hyped sentence for finishing)
}

Child profile:
- Name: ${data.childName}
- Age: ${data.age}
- School level: ${data.level}
- Interests: ${data.interests.join(", ")}
- Subject: ${data.subject}
- Topic preference: ${data.topic ?? "choose an engaging topic appropriate for the level"}
- Difficulty (1 easy, 4 hard): ${data.difficulty}

Return ONLY the JSON object.`;
    const { text: raw } = await callAI([
      { role: "system", content: sys },
      { role: "user", content: prompt },
    ], true);
    let parsed: unknown;
    try { parsed = JSON.parse(raw); } catch {
      const m = raw.match(/\{[\s\S]*\}/);
      if (!m) throw new Error("La IA respondió en un formato inesperado.");
      parsed = JSON.parse(m[0]);
    }
    return { lessonId: data.lessonId, lesson: parsed as LessonShape };
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
  type: "text" | "image" | "example" | "tip";
  text?: string;
  imagePrompt?: string;
  caption?: string;
  icon?: string;
  title?: string;
  body?: string;
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
});

export const generateHeroImage = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => imgInput.parse(d))
  .handler(async ({ data }): Promise<{ url: string }> => {
    const interestsLine = data.interests.length ? ` Subtly weave in elements the child loves: ${data.interests.join(", ")}.` : "";
    const fullPrompt = `Friendly, vibrant cartoon illustration for a children's lesson hero banner. ${data.prompt}${interestsLine} Bold flat colors, soft shapes, cheerful lighting, no text, no logos, wide 16:9 composition.`;
    const { images } = await callAI(
      [{ role: "user", content: fullPrompt }],
      false,
      IMAGE_MODEL,
      ["image", "text"],
    );
    const url = images[0] ?? "";
    return { url };
  });
