import { useGenTheme } from "./primitives";
import { type Tone } from "@/lib/theme-from-interests";
import { GeoMascot, type EyeLook } from "@/components/companion/Companion";
import type { GeoShape } from "@/components/companion/characters";

const TONE_VAR: Record<Tone, string> = {
  primary: "var(--primary)",
  coral: "var(--coral)",
  mint: "var(--mint)",
  sky: "var(--sky)",
  accent: "var(--accent)",
};

// Each themed "world" keeps its own silhouette so the learner recognizes their mascot.
const SHAPE_BY_THEME: Record<string, GeoShape> = {
  spider: "square",
  auto: "square",
  dino: "triangle",
  game: "pentagon",
  robot: "pentagon",
};

const LOOK: Record<"happy" | "wow" | "calm" | "wink", EyeLook> = {
  happy: "open",
  wow: "wide",
  calm: "closed",
  wink: "arc",
};

/** Geometric mascot tinted by the active lesson theme. Eyes only, no mouth. */
export function KawaiiBlob({
  size = 120,
  mood = "happy",
  tone,
  className = "",
}: {
  size?: number;
  mood?: "happy" | "wow" | "calm" | "wink";
  tone?: Tone;
  className?: string;
}) {
  const theme = useGenTheme();
  return (
    <GeoMascot
      shape={SHAPE_BY_THEME[theme.id] ?? "circle"}
      color={TONE_VAR[tone ?? theme.tone]}
      size={size}
      look={LOOK[mood]}
      className={className}
    />
  );
}

/** Row of mascots in the five brand tones. */
export function KawaiiBlobCluster({ size = 80 }: { size?: number }) {
  const items: { tone: Tone; shape: GeoShape }[] = [
    { tone: "primary", shape: "circle" },
    { tone: "accent", shape: "triangle" },
    { tone: "mint", shape: "square" },
    { tone: "sky", shape: "pentagon" },
    { tone: "coral", shape: "circle" },
  ];
  return (
    <div className="flex items-end gap-2 justify-center flex-wrap">
      {items.map((it) => (
        <GeoMascot key={it.tone} shape={it.shape} color={TONE_VAR[it.tone]} size={size} />
      ))}
    </div>
  );
}
