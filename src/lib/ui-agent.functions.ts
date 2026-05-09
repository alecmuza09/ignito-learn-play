import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";
const MODEL = "google/gemini-3-flash-preview";

const reactionInput = z.object({
  event: z.enum(["correct", "wrong", "streak", "complete", "stuck", "start"]),
  childName: z.string(),
  age: z.number(),
  interests: z.array(z.string()),
  themeId: z.string(),
  language: z.string(),
  context: z.object({
    correctSoFar: z.number().default(0),
    wrongSoFar: z.number().default(0),
    questionIndex: z.number().default(0),
    questionTotal: z.number().default(0),
    lessonTitle: z.string().optional(),
  }).default({ correctSoFar: 0, wrongSoFar: 0, questionIndex: 0, questionTotal: 0 }),
});

export interface AgentReactionPayload {
  kind: "celebrate" | "encourage" | "hint" | "level-up" | "ambient";
  tone: "primary" | "coral" | "mint" | "sky" | "accent";
  headline: string;
  message: string;
  particles: string[];
  intensity: "calm" | "normal" | "epic";
  ttlMs: number;
}

/**
 * The UI agent: given an event + context, returns a structured reaction
 * the frontend renders via <GenReaction>. Keeps the agent in control of
 * which UI primitive fires, in which tone, and with what message.
 */
export const decideReaction = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => reactionInput.parse(d))
  .handler(async ({ data }): Promise<{ reaction: AgentReactionPayload }> => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("Falta LOVABLE_API_KEY");
    const lang = data.language === "en" ? "English" : "Spanish";

    const sys = `You are the IGNOTO UI Agent. You react to in-app events for ${data.childName} (age ${data.age}) by choosing UI primitives the frontend will render. Always respond in ${lang}. Keep it short (headline <=4 words, message <=14 words). Use the child's interests as the emotional language: ${data.interests.join(", ") || "general kid"}. Active visual theme: ${data.themeId}.`;

    const prompt = `Event: ${data.event}
Context: ${JSON.stringify(data.context)}

Return STRICT JSON (no markdown):
{
  "kind": "celebrate"|"encourage"|"hint"|"level-up"|"ambient",
  "tone": "primary"|"coral"|"mint"|"sky"|"accent",
  "headline": string,
  "message": string,
  "particles": string[] (1-4 emoji that fit the child's interests/theme),
  "intensity": "calm"|"normal"|"epic",
  "ttlMs": number (1500-4000)
}

Mapping hints (you may override creatively):
- correct -> celebrate, particles thematic, intensity normal/epic on streak
- wrong   -> encourage, calm/normal, never shame, suggest a tiny next step
- streak  -> level-up, epic, big particles
- complete-> level-up, epic
- stuck   -> hint, calm, give a one-line nudge using interest analogy
- start   -> ambient, calm`;

    const res = await fetch(GATEWAY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model: MODEL,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: sys },
          { role: "user", content: prompt },
        ],
      }),
    });
    if (!res.ok) {
      const txt = await res.text();
      if (res.status === 429) throw new Error("Demasiadas solicitudes.");
      if (res.status === 402) throw new Error("Sin créditos de IA.");
      throw new Error(`AI error ${res.status}: ${txt.slice(0, 200)}`);
    }
    const data2 = await res.json();
    const raw: string = data2.choices?.[0]?.message?.content ?? "";
    let parsed: AgentReactionPayload;
    try { parsed = JSON.parse(raw) as AgentReactionPayload; }
    catch {
      const m = raw.match(/\{[\s\S]*\}/);
      if (!m) throw new Error("Respuesta del agente inválida");
      parsed = JSON.parse(m[0]) as AgentReactionPayload;
    }
    // Defensive clamps
    parsed.ttlMs = Math.max(1500, Math.min(4000, parsed.ttlMs ?? 2200));
    if (!Array.isArray(parsed.particles) || parsed.particles.length === 0) parsed.particles = ["✨"];
    return { reaction: parsed };
  });