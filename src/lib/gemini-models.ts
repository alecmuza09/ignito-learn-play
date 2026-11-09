// Gemini model ids, newest first. Each call walks the list until one answers, so a
// renamed or retired model degrades to the next one instead of breaking IGNO.
// GEMINI_TEXT_MODEL / GEMINI_IMAGE_MODEL (env) take priority when set.
const GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta/models";

export const TEXT_MODELS = [
  process.env.GEMINI_TEXT_MODEL,
  "gemini-4-argon",
  "gemini-3.8-flash",
].filter((m): m is string => !!m);
/** Quick UI reactions where latency matters more than depth. */
export const FAST_MODELS = ["gemini-3.8-flash", "gemini-3.6-flash"];
export const IMAGE_MODELS = [
  process.env.GEMINI_IMAGE_MODEL,
  "gemini-nano-banana-2.1",
  "gemini-3-pro-image",
].filter((m): m is string => !!m);

export function geminiKey() {
  return process.env.GEMINI_API_KEY ?? process.env.GOOGLE_API_KEY;
}

/** POSTs `body` to generateContent, trying each model in order. Returns the parsed JSON. */
export async function geminiGenerate(
  models: string[],
  body: unknown,
  opts: { signal?: AbortSignal } = {},
): Promise<unknown> {
  const key = geminiKey();
  if (!key) throw new Error("Falta GEMINI_API_KEY");
  let lastError = "";
  for (const model of models) {
    const res = await fetch(`${GEMINI_BASE}/${model}:generateContent?key=${key}`, {
      method: "POST",
      signal: opts.signal,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) return res.json();
    const txt = await res.text();
    lastError = `Gemini ${model} ${res.status}: ${txt.slice(0, 240)}`;
    // Bad request bodies fail the same on every model; anything else may be model-specific.
    if (res.status === 400 && !/model|not found|unsupported/i.test(txt)) break;
    console.warn(`[gemini] ${lastError}`);
  }
  throw new Error(lastError);
}
