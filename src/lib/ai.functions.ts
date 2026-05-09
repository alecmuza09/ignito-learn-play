import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";
const MODEL = "google/gemini-3-flash-preview";

async function callAI(messages: { role: string; content: string }[], jsonMode = false): Promise<string> {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("Falta LOVABLE_API_KEY");
  const body: Record<string, unknown> = { model: MODEL, messages };
  if (jsonMode) body.response_format = { type: "json_object" };
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
  return data.choices?.[0]?.message?.content ?? "";
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

export const generateLesson = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => lessonInput.parse(d))
  .handler(async ({ data }) => {
    const lang = data.language === "en" ? "English" : "Spanish";
    const sys = `You are IGNO, a playful, expert tutor for kids on the IGNOTO platform. Always reply in ${lang}, with energy and warmth. Use the child's interests as the metaphor backbone of every explanation. NEVER sound like a textbook. Sound like a video-game cutscene. Use emojis sparingly but joyfully.`;
    const prompt = `Create ONE adaptive lesson as STRICT JSON (no markdown fences) with this shape:
{
 "title": string (catchy, age-appropriate),
 "objective": string (1 sentence learning goal),
 "story": string (2-4 sentence story hook connecting the topic to the child's interests),
 "heroImagePrompt": string (vivid English DALL-E style prompt for a hero illustration: friendly, colorful, kid-friendly cartoon),
 "sections": [ { "kind": "explanation"|"funFact"|"analogy"|"miniChallenge", "title": string, "body": string } ] (3 to 5 items, mixed kinds),
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
    const raw = await callAI([
      { role: "system", content: sys },
      { role: "user", content: prompt },
    ], true);
    let parsed: unknown;
    try { parsed = JSON.parse(raw); } catch {
      const m = raw.match(/\{[\s\S]*\}/);
      if (!m) throw new Error("La IA respondió en un formato inesperado.");
      parsed = JSON.parse(m[0]);
    }
    return { lessonId: data.lessonId, lesson: parsed };
  });

const ignoInput = z.object({
  question: z.string().min(1).max(500),
  childName: z.string(),
  age: z.number(),
  interests: z.array(z.string()),
  lessonContext: z.string().optional(),
  language: z.string(),
});

export const askIgno = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => ignoInput.parse(d))
  .handler(async ({ data }) => {
    const lang = data.language === "en" ? "English" : "Spanish";
    const sys = `You are IGNO, a wise but playful owl tutor for ${data.childName}, age ${data.age}. Always reply in ${lang} with warmth, brevity (max 4 short sentences), and use their interests (${data.interests.join(", ")}) as analogies. Never lecture. Be a friend who happens to be brilliant.`;
    const user = `${data.lessonContext ? `(Contexto de la lección: ${data.lessonContext})\n\n` : ""}Pregunta: ${data.question}`;
    const reply = await callAI([
      { role: "system", content: sys },
      { role: "user", content: user },
    ]);
    return { reply };
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
    const reply = await callAI([
      { role: "system", content: sys },
      { role: "user", content: prompt },
    ]);
    return { report: reply };
  });
