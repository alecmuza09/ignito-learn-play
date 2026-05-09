import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { blockZ, type GenBlock } from "@/lib/gen-blocks";

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

export interface AgentLayoutAction {
  insertBlock?: GenBlock | null;
}

/**
 * The UI agent: given an event + context, returns a structured reaction
 * the frontend renders via <GenReaction>. Keeps the agent in control of
 * which UI primitive fires, in which tone, and with what message.
 */
export const decideReaction = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => reactionInput.parse(d))
  .handler(async ({ data }): Promise<{ reaction: AgentReactionPayload; layout: AgentLayoutAction }> => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("Falta LOVABLE_API_KEY");
    const lang = data.language === "en" ? "English" : "Spanish";

    const sys = `You are the IGNOTO UI Agent in charge of GENERATIVE UI. You react to in-app events for ${data.childName} (age ${data.age}) by 1) emitting a quick reaction overlay AND 2) optionally INJECTING a new UI block into the live lesson. Always respond in ${lang}. Keep it short. Use the child's interests as the emotional language: ${data.interests.join(", ") || "general kid"}. Active visual theme: ${data.themeId}.`;

    const prompt = `Event: ${data.event}
Context: ${JSON.stringify(data.context)}

Return STRICT JSON:
{
  "reaction": {
    "kind": "celebrate"|"encourage"|"hint"|"level-up"|"ambient",
    "tone": "primary"|"coral"|"mint"|"sky"|"accent",
    "headline": string (<=4 words),
    "message": string (<=14 words),
    "particles": string[] (1-4 emoji that fit the child's interests),
    "intensity": "calm"|"normal"|"epic",
    "ttlMs": number (1500-4000)
  },
  "insertBlock": null OR a GenBlock to inject into the lesson NOW.
}

When to set insertBlock:
- "streak" -> a "celebrate" block { "type":"celebrate", "message": "...", "particles":[...] } (always).
- "wrong"  (wrongSoFar >= 2) -> a gentle "callout" block { "type":"callout", "icon":"💛", "title": "...", "body":"a tiny analogy that helps next time" }.
- "stuck"  -> a "mascotSays" block { "type":"mascotSays", "text":"<one-line hint using their interest>", "mood":"wink" }.
- "complete" -> a "celebrate" block.
- otherwise (correct/start) -> "insertBlock": null.

Allowed insert block types: "callout" | "mascotSays" | "celebrate".
Use ONLY the fields shown above. The frontend renders it immediately and tags it as "🤖 IA en vivo".`;

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
    let outer: { reaction?: AgentReactionPayload; insertBlock?: unknown };
    try { outer = JSON.parse(raw); }
    catch {
      const m = raw.match(/\{[\s\S]*\}/);
      if (!m) throw new Error("Respuesta del agente inválida");
      outer = JSON.parse(m[0]);
    }
    const reaction: AgentReactionPayload = (outer.reaction ?? (outer as unknown as AgentReactionPayload));
    reaction.ttlMs = Math.max(1500, Math.min(4000, reaction.ttlMs ?? 2200));
    if (!Array.isArray(reaction.particles) || reaction.particles.length === 0) reaction.particles = ["✨"];
    let insertBlock: GenBlock | null = null;
    if (outer.insertBlock && typeof outer.insertBlock === "object") {
      const r = blockZ.safeParse(outer.insertBlock);
      if (r.success && (r.data.type === "callout" || r.data.type === "mascotSays" || r.data.type === "celebrate")) {
        insertBlock = r.data;
      }
    }
    return { reaction, layout: { insertBlock } };
  });