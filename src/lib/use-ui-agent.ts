import { useCallback, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { decideReaction } from "@/lib/ui-agent.functions";
import type { AgentReaction } from "@/components/gen-ui/primitives";
import { GenTheme } from "@/lib/theme-from-interests";
import type { IgnotoProfile } from "@/lib/profile";

type Event = "correct" | "wrong" | "streak" | "complete" | "stuck" | "start";

/** Local rule-based fallback so UI reacts INSTANTLY while AI thinks. */
function localReaction(event: Event, theme: GenTheme): AgentReaction {
  const pickC = theme.cheers[Math.floor(Math.random() * theme.cheers.length)];
  const pickO = theme.oops[Math.floor(Math.random() * theme.oops.length)];
  switch (event) {
    case "correct":  return { kind: "celebrate", tone: theme.tone, headline: pickC, message: "+XP", particles: theme.particles, intensity: "normal", ttlMs: 1800 };
    case "wrong":    return { kind: "encourage", tone: "accent",   headline: pickO, message: "Otra vez con calma 💛", particles: ["💭"], intensity: "calm", ttlMs: 1800 };
    case "streak":   return { kind: "level-up",  tone: theme.accentTone, headline: "¡COMBO!", message: "Cadena de aciertos 🔥", particles: theme.particles, intensity: "epic", ttlMs: 2400 };
    case "complete": return { kind: "level-up",  tone: theme.tone, headline: "¡Misión completa!", message: "Tu mundo crece contigo", particles: theme.particles, intensity: "epic", ttlMs: 2800 };
    case "stuck":    return { kind: "hint",      tone: "sky",      headline: "Pista", message: "Piensa en tu héroe favorito 💡", particles: ["💡"], intensity: "calm", ttlMs: 2400 };
    case "start":    return { kind: "ambient",   tone: theme.tone, headline: "¡A jugar!", message: "Estoy contigo 🦉", particles: [], intensity: "calm", ttlMs: 1500 };
  }
}

export function useUIAgent(profile: IgnotoProfile | null, theme: GenTheme, lessonTitle?: string) {
  const [reaction, setReaction] = useState<AgentReaction | null>(null);
  const decide = useServerFn(decideReaction);

  const emit = useCallback((event: Event, context?: { correctSoFar?: number; wrongSoFar?: number; questionIndex?: number; questionTotal?: number }) => {
    // 1. Instant local reaction → UI never feels laggy.
    const instant = localReaction(event, theme);
    setReaction({ ...instant, ttlMs: instant.ttlMs });

    // 2. Ask the agent for a richer, personalized reaction; replace if still relevant.
    if (!profile) return;
    decide({ data: {
      event, childName: profile.childName, age: profile.age,
      interests: profile.interests, themeId: theme.id, language: profile.language,
      context: {
        correctSoFar: context?.correctSoFar ?? 0,
        wrongSoFar: context?.wrongSoFar ?? 0,
        questionIndex: context?.questionIndex ?? 0,
        questionTotal: context?.questionTotal ?? 0,
        lessonTitle,
      },
    }})
      .then((r) => setReaction(r.reaction as AgentReaction))
      .catch(() => { /* keep instant fallback */ });
  }, [profile, theme, decide, lessonTitle]);

  return { reaction, emit, clear: () => setReaction(null) };
}