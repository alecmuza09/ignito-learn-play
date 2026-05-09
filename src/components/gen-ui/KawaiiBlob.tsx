import { useGenTheme } from "./primitives";
import { type Tone } from "@/lib/theme-from-interests";

const TONE_VAR: Record<Tone, string> = {
  primary: "var(--primary)",
  coral:   "var(--coral)",
  mint:    "var(--mint)",
  sky:     "var(--sky)",
  accent:  "var(--accent)",
};

/**
 * Kawaii blob mascot — soft pastel shape with a tiny smile.
 * Shape and color shift with the active theme so the kid recognizes "their" mascot.
 */
export function KawaiiBlob({ size = 120, mood = "happy", tone, className = "" }: {
  size?: number;
  mood?: "happy" | "wow" | "calm" | "wink";
  tone?: Tone;
  className?: string;
}) {
  const theme = useGenTheme();
  const fill = TONE_VAR[tone ?? theme.tone];
  // High-contrast facial features. We use a near-white "ink" so faces always read
  // against the colored blob (the previous near-black ink disappeared on dark fills).
  const ink = "oklch(0.99 0 0)";
  const cheek = "oklch(0.78 0.10 20 / 0.55)";
  // pick a shape variant by theme id so each "world" gets its own silhouette
  const variant = SHAPES[theme.id as keyof typeof SHAPES] ?? SHAPES.default;

  return (
    <div className={`relative inline-block ${className}`} style={{ width: size, height: size }}>
      <svg viewBox="0 0 120 120" width={size} height={size} className="overflow-visible">
        {/* soft drop shadow */}
        <ellipse cx="60" cy="112" rx="36" ry="4" fill="oklch(0.2 0.05 280 / 0.12)" />
        {/* main blob */}
        <path d={variant.path} fill={fill} />
        {/* highlight */}
        <ellipse cx={variant.hl.cx} cy={variant.hl.cy} rx="9" ry="6" fill="white" opacity="0.45" />
        {/* eyes */}
        <Eye cx={variant.eyes.l.x} cy={variant.eyes.l.y} mood={mood} side="l" ink={ink} />
        <Eye cx={variant.eyes.r.x} cy={variant.eyes.r.y} mood={mood} side="r" ink={ink} />
        {/* mouth */}
        <Mouth cx={variant.mouth.x} cy={variant.mouth.y} mood={mood} ink={ink} />
        {/* cheeks */}
        <circle cx={variant.eyes.l.x - 6} cy={variant.eyes.l.y + 8} r="3.2" fill={cheek} />
        <circle cx={variant.eyes.r.x + 6} cy={variant.eyes.r.y + 8} r="3.2" fill={cheek} />
      </svg>
    </div>
  );
}

function Eye({ cx, cy, mood, side, ink }: { cx: number; cy: number; mood: string; side: "l" | "r"; ink: string }) {
  if (mood === "wink" && side === "l") {
    return <path d={`M ${cx - 4} ${cy} Q ${cx} ${cy + 3} ${cx + 4} ${cy}`} stroke={ink} strokeWidth="2.4" fill="none" strokeLinecap="round" />;
  }
  if (mood === "wow") {
    return <ellipse cx={cx} cy={cy} rx="3" ry="4.5" fill={ink} />;
  }
  if (mood === "calm") {
    return <path d={`M ${cx - 4} ${cy + 1} Q ${cx} ${cy - 2} ${cx + 4} ${cy + 1}`} stroke={ink} strokeWidth="2.4" fill="none" strokeLinecap="round" />;
  }
  return (
    <>
      <circle cx={cx} cy={cy} r="3.4" fill={ink} />
      <circle cx={cx + 1} cy={cy - 1} r="1.1" fill="oklch(0.2 0.05 280)" />
    </>
  );
}

function Mouth({ cx, cy, mood, ink }: { cx: number; cy: number; mood: string; ink: string }) {
  if (mood === "wow") {
    return <ellipse cx={cx} cy={cy} rx="3" ry="4" fill={ink} />;
  }
  return <path d={`M ${cx - 5} ${cy} Q ${cx} ${cy + 5} ${cx + 5} ${cy}`} stroke={ink} strokeWidth="2.6" fill="none" strokeLinecap="round" />;
}

const BLOB_SOFT = "M 60 12 C 88 12 108 32 108 60 C 108 88 88 108 60 108 C 32 108 12 88 12 60 C 12 32 32 12 60 12 Z";
const PENTAGON = "M 60 10 L 106 44 L 88 100 L 32 100 L 14 44 Z";
const SQUIRCLE = "M 60 10 C 96 10 110 24 110 60 C 110 96 96 110 60 110 C 24 110 10 96 10 60 C 10 24 24 10 60 10 Z";
const TRIANGLE = "M 60 12 L 110 100 L 10 100 Z";
const CLOUD = "M 30 70 C 18 70 14 56 26 50 C 22 36 40 30 48 40 C 54 26 80 30 82 46 C 100 44 102 66 88 70 Z";

const SHAPES = {
  spider:   { path: SQUIRCLE, hl: { cx: 50, cy: 36 }, eyes: { l: { x: 48, y: 56 }, r: { x: 72, y: 56 } }, mouth: { x: 60, y: 76 } },
  bat:      { path: BLOB_SOFT, hl: { cx: 50, cy: 38 }, eyes: { l: { x: 50, y: 58 }, r: { x: 70, y: 58 } }, mouth: { x: 60, y: 76 } },
  space:    { path: BLOB_SOFT, hl: { cx: 50, cy: 38 }, eyes: { l: { x: 50, y: 58 }, r: { x: 70, y: 58 } }, mouth: { x: 60, y: 76 } },
  dino:     { path: TRIANGLE, hl: { cx: 56, cy: 50 }, eyes: { l: { x: 50, y: 64 }, r: { x: 70, y: 64 } }, mouth: { x: 60, y: 80 } },
  game:     { path: PENTAGON, hl: { cx: 50, cy: 40 }, eyes: { l: { x: 48, y: 58 }, r: { x: 72, y: 58 } }, mouth: { x: 60, y: 78 } },
  princess: { path: CLOUD, hl: { cx: 48, cy: 48 }, eyes: { l: { x: 48, y: 58 }, r: { x: 72, y: 58 } }, mouth: { x: 60, y: 72 } },
  auto:     { path: SQUIRCLE, hl: { cx: 50, cy: 36 }, eyes: { l: { x: 48, y: 56 }, r: { x: 72, y: 56 } }, mouth: { x: 60, y: 76 } },
  robot:    { path: PENTAGON, hl: { cx: 50, cy: 40 }, eyes: { l: { x: 48, y: 58 }, r: { x: 72, y: 58 } }, mouth: { x: 60, y: 78 } },
  nature:   { path: CLOUD, hl: { cx: 48, cy: 48 }, eyes: { l: { x: 48, y: 58 }, r: { x: 72, y: 58 } }, mouth: { x: 60, y: 72 } },
  default:  { path: BLOB_SOFT, hl: { cx: 50, cy: 38 }, eyes: { l: { x: 50, y: 58 }, r: { x: 70, y: 58 } }, mouth: { x: 60, y: 76 } },
};

/** Decorative cluster of 5 kawaii blobs in different tones — like the reference splash. */
export function KawaiiBlobCluster({ size = 80 }: { size?: number }) {
  const tones: Tone[] = ["primary", "coral", "mint", "sky", "accent"];
  const moods: ("happy" | "wow" | "calm" | "wink")[] = ["happy", "wink", "happy", "calm", "wow"];
  return (
    <div className="flex items-end gap-2 justify-center flex-wrap">
      {tones.map((tone, i) => (
        <div key={tone} className="animate-float" style={{ animationDelay: `${i * 0.3}s` }}>
          <KawaiiBlob size={size} tone={tone} mood={moods[i]} />
        </div>
      ))}
    </div>
  );
}