import { GeoMascot, type EyeLook } from "./companion/Companion";
import type { GeoShape } from "./companion/characters";

type Shape = "blob" | "circle" | "pentagon" | "square" | "triangle" | "drop";
type Mood = "happy" | "sleepy" | "wink" | "smile" | "star";

const GEO: Record<Shape, GeoShape> = {
  blob: "circle",
  circle: "circle",
  drop: "circle",
  pentagon: "pentagon",
  square: "square",
  triangle: "triangle",
};
const LOOK: Record<Mood, EyeLook> = {
  happy: "open",
  smile: "open",
  wink: "arc",
  star: "arc",
  sleepy: "closed",
};

/** Flat geometric mascot with eyes (kept under its old name for existing call sites). */
export function KawaiiBlob({
  shape = "blob",
  color = "var(--primary)",
  size = 64,
  mood = "happy",
  className = "",
}: {
  shape?: Shape;
  color?: string;
  size?: number;
  mood?: Mood;
  className?: string;
}) {
  return (
    <GeoMascot
      shape={GEO[shape]}
      color={color}
      size={size}
      look={LOOK[mood]}
      className={className}
    />
  );
}

/** Pick a (shape,color) deterministically from a string seed (e.g. interest). */
export function blobFromSeed(seed: string, palette: string[]): { shape: Shape; color: string } {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  const shapes: Shape[] = ["circle", "pentagon", "square", "triangle"];
  return {
    shape: shapes[h % shapes.length],
    color: palette[h % palette.length],
  };
}
