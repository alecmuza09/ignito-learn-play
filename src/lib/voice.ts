import { useCallback, useEffect, useRef, useState } from "react";

/** Strips emoji, markdown and URLs so the voice reads only words. */
export function speakableText(text: string) {
  return text
    .replace(/https?:\/\/\S+/g, "")
    .replace(/[*_#`>~[\]()]/g, "")
    .replace(/\p{Extended_Pictographic}|️|‍/gu, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 900);
}

function base64ToBytes(b64: string) {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

/** Wraps headerless 16-bit PCM in a WAV container so the browser can decode it. */
function pcmToWav(pcm: Uint8Array, sampleRate: number) {
  const header = new ArrayBuffer(44);
  const v = new DataView(header);
  const write = (o: number, s: string) =>
    [...s].forEach((c, i) => v.setUint8(o + i, c.charCodeAt(0)));
  write(0, "RIFF");
  v.setUint32(4, 36 + pcm.length, true);
  write(8, "WAVE");
  write(12, "fmt ");
  v.setUint32(16, 16, true);
  v.setUint16(20, 1, true);
  v.setUint16(22, 1, true);
  v.setUint32(24, sampleRate, true);
  v.setUint32(28, sampleRate * 2, true);
  v.setUint16(32, 2, true);
  v.setUint16(34, 16, true);
  write(36, "data");
  v.setUint32(40, pcm.length, true);
  const out = new Uint8Array(44 + pcm.length);
  out.set(new Uint8Array(header), 0);
  out.set(pcm, 44);
  return out.buffer;
}

export function audioBufferFromGemini(b64: string, mimeType: string) {
  const bytes = base64ToBytes(b64);
  if (/wav/i.test(mimeType)) return bytes.buffer;
  const rate = Number(/rate=(\d+)/i.exec(mimeType)?.[1] ?? 24000);
  return pcmToWav(bytes, rate);
}

type Fetcher = (text: string) => Promise<{ audio: string; mimeType: string } | null>;

/**
 * Plays companion speech and exposes `getLevel()` (0..1 loudness) for lip-sync.
 * Uses Gemini audio when available, otherwise the browser's built-in voice.
 */
export function useCompanionVoice(fetchAudio: Fetcher, lang: "es" | "en" | "bi") {
  const [speaking, setSpeaking] = useState(false);
  const ctxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const dataRef = useRef<Uint8Array<ArrayBuffer> | null>(null);
  const synthLevel = useRef(-1);
  const token = useRef(0);

  const stop = useCallback(() => {
    token.current++;
    try {
      sourceRef.current?.stop();
    } catch {
      /* already stopped */
    }
    sourceRef.current = null;
    if (typeof window !== "undefined" && "speechSynthesis" in window)
      window.speechSynthesis.cancel();
    synthLevel.current = -1;
    setSpeaking(false);
  }, []);

  useEffect(() => stop, [stop]);

  const getLevel = useCallback(() => {
    const an = analyserRef.current;
    if (sourceRef.current && an && dataRef.current) {
      an.getByteTimeDomainData(dataRef.current);
      let sum = 0;
      for (const v of dataRef.current) sum += ((v - 128) / 128) ** 2;
      return Math.sqrt(sum / dataRef.current.length);
    }
    return synthLevel.current;
  }, []);

  const speakWithBrowser = useCallback(
    (text: string, my: number) =>
      new Promise<void>((resolve) => {
        if (!("speechSynthesis" in window)) return resolve();
        const u = new SpeechSynthesisUtterance(text);
        u.lang = lang === "en" ? "en-US" : "es-MX";
        u.rate = 1.02;
        u.pitch = 1.15;
        // The browser voice has no audio stream to analyse, so pulse on each word boundary.
        u.onboundary = () => {
          if (token.current !== my) return;
          synthLevel.current = 0.35;
          setTimeout(() => (synthLevel.current = 0.08), 120);
        };
        u.onend = u.onerror = () => resolve();
        window.speechSynthesis.speak(u);
      }),
    [lang],
  );

  const speak = useCallback(
    async (raw: string) => {
      stop();
      const text = speakableText(raw);
      if (!text) return;
      const my = token.current;
      setSpeaking(true);
      try {
        // AudioContext must be created/resumed inside the user gesture chain.
        ctxRef.current ??= new AudioContext();
        const ctx = ctxRef.current;
        if (ctx.state === "suspended") await ctx.resume();
        const res = await fetchAudio(text).catch(() => null);
        if (token.current !== my) return;
        if (res) {
          const buf = await ctx.decodeAudioData(audioBufferFromGemini(res.audio, res.mimeType));
          if (token.current !== my) return;
          const src = ctx.createBufferSource();
          src.buffer = buf;
          const an = (analyserRef.current ??= ctx.createAnalyser());
          an.fftSize = 512;
          dataRef.current = new Uint8Array(an.fftSize);
          src.connect(an);
          an.connect(ctx.destination);
          sourceRef.current = src;
          await new Promise<void>((resolve) => {
            src.onended = () => resolve();
            src.start();
          });
        } else {
          synthLevel.current = 0.08;
          await speakWithBrowser(text, my);
        }
      } catch (e) {
        console.warn("[voice] playback failed", e);
      } finally {
        if (token.current === my) {
          sourceRef.current = null;
          synthLevel.current = -1;
          setSpeaking(false);
        }
      }
    },
    [fetchAudio, speakWithBrowser, stop],
  );

  return { speak, stop, speaking, getLevel };
}

type Recognition = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  start: () => void;
  stop: () => void;
  onresult:
    | ((e: {
        results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }>;
      }) => void)
    | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
};

/** Push-to-talk speech recognition where the browser supports it. */
export function useSpeechInput(lang: "es" | "en" | "bi", onFinal: (text: string) => void) {
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState("");
  const recRef = useRef<Recognition | null>(null);
  const finalRef = useRef(onFinal);
  finalRef.current = onFinal;

  useEffect(() => {
    const w = window as unknown as {
      SpeechRecognition?: new () => Recognition;
      webkitSpeechRecognition?: new () => Recognition;
    };
    setSupported(!!(w.SpeechRecognition ?? w.webkitSpeechRecognition));
  }, []);

  const start = useCallback(() => {
    const w = window as unknown as {
      SpeechRecognition?: new () => Recognition;
      webkitSpeechRecognition?: new () => Recognition;
    };
    const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
    if (!Ctor) return;
    const rec = new Ctor();
    rec.lang = lang === "en" ? "en-US" : "es-MX";
    rec.interimResults = true;
    rec.continuous = false;
    let finalText = "";
    rec.onresult = (e) => {
      let text = "";
      for (const r of Array.from(e.results)) {
        text += r[0].transcript;
        if (r.isFinal) finalText = text;
      }
      setInterim(text);
    };
    rec.onend = () => {
      setListening(false);
      setInterim("");
      if (finalText.trim()) finalRef.current(finalText.trim());
    };
    rec.onerror = () => setListening(false);
    recRef.current = rec;
    setListening(true);
    rec.start();
  }, [lang]);

  const stop = useCallback(() => recRef.current?.stop(), []);

  return { supported, listening, interim, start, stop };
}
