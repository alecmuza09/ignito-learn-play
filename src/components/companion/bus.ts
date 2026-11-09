import type { CompanionState } from "./Companion";

/** App-wide nudges for the floating companion (quiz answers, lesson complete, etc.). */
export type CompanionReaction = { state: CompanionState; say?: string; ms?: number };

const EVENT = "ignoto:companion";

export function reactCompanion(reaction: CompanionReaction) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent<CompanionReaction>(EVENT, { detail: reaction }));
}

export function onCompanionReaction(handler: (r: CompanionReaction) => void) {
  const h = (e: Event) => handler((e as CustomEvent<CompanionReaction>).detail);
  window.addEventListener(EVENT, h);
  return () => window.removeEventListener(EVENT, h);
}
