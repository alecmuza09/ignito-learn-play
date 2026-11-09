import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { withSupabaseToken } from "@/lib/auth-client-middleware";

const GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta/models";
// Newest first; older ids stay as fallbacks while Google rolls models over.
const TTS_MODELS = [
  "gemini-3.8-flash-tts",
  "gemini-3.8-flash-lite-tts",
  "gemini-3.1-flash-tts-preview",
];

const speakInput = z.object({
  text: z.string().min(1).max(900),
  voice: z
    .string()
    .min(2)
    .max(40)
    .regex(/^[A-Za-z]+$/),
  audience: z.enum(["kids", "adult"]).default("kids"),
  language: z.enum(["es", "en", "bi"]).default("es"),
});

/** Gemini text-to-speech. Returns base64 audio; the client falls back to the browser voice on error. */
export const ignoSpeak = createServerFn({ method: "POST" })
  .middleware([withSupabaseToken, requireSupabaseAuth])
  .inputValidator((d: unknown) => speakInput.parse(d))
  .handler(async ({ data }): Promise<{ audio: string; mimeType: string } | { error: string }> => {
    const key = process.env.GEMINI_API_KEY;
    if (!key) return { error: "Falta GEMINI_API_KEY" };
    const lang = data.language === "en" ? "English" : "Mexican Spanish";
    const style =
      data.audience === "kids"
        ? `Say in ${lang}, warm, playful and upbeat, like a friendly cartoon tutor talking to a child:`
        : `Say in ${lang}, clear, calm and friendly, like a knowledgeable mentor:`;
    const body = {
      contents: [{ role: "user", parts: [{ text: `${style}\n${data.text}` }] }],
      generationConfig: {
        responseModalities: ["AUDIO"],
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: data.voice } } },
      },
    };
    let lastError = "";
    for (const model of TTS_MODELS) {
      try {
        const res = await fetch(`${GEMINI_BASE}/${model}:generateContent?key=${key}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
          signal: AbortSignal.timeout(20_000),
        });
        if (!res.ok) {
          lastError = `${model} ${res.status}: ${(await res.text()).slice(0, 200)}`;
          continue;
        }
        const json = await res.json();
        const parts = json?.candidates?.[0]?.content?.parts ?? [];
        for (const p of parts) {
          const inline = p?.inlineData ?? p?.inline_data;
          if (inline?.data)
            return {
              audio: inline.data,
              mimeType: inline.mimeType ?? inline.mime_type ?? "audio/L16;rate=24000",
            };
        }
        lastError = `${model}: sin audio en la respuesta`;
      } catch (e) {
        lastError = `${model}: ${(e as Error).message}`;
      }
    }
    console.warn("[ignoSpeak]", lastError);
    return { error: lastError };
  });
