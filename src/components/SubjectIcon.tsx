import {
  Award,
  BookOpen,
  Brain,
  Calculator,
  Code2,
  Compass,
  FlaskConical,
  Globe2,
  Landmark,
  Languages,
  Microscope,
  Music2,
  Palette,
  Puzzle,
  Sprout,
  Trophy,
  Flame,
  type LucideIcon,
} from "lucide-react";

const SUBJECT: Record<string, { icon: LucideIcon; bg: string }> = {
  matematicas: { icon: Calculator, bg: "var(--pink)" },
  lectura: { icon: BookOpen, bg: "var(--coral)" },
  ciencias: { icon: FlaskConical, bg: "var(--mint)" },
  historia: { icon: Landmark, bg: "var(--lime)" },
  geografia: { icon: Globe2, bg: "var(--sky)" },
  arte: { icon: Palette, bg: "var(--coral)" },
  musica: { icon: Music2, bg: "var(--pink)" },
  ingles: { icon: Languages, bg: "var(--sky)" },
  programacion: { icon: Code2, bg: "var(--mint)" },
  logica: { icon: Puzzle, bg: "var(--lime)" },
};

const BADGE: Record<string, LucideIcon> = {
  "primer-paso": Sprout,
  "racha-3": Flame,
  sabelotodo: Brain,
  explorador: Compass,
  matematico: Calculator,
  lector: BookOpen,
  cientifico: Microscope,
  leyenda: Trophy,
};

/** Line icon on a colored sticker tile; replaces the old per-subject emoji. */
export function SubjectIcon({
  id,
  size = 40,
  className = "",
}: {
  id: string;
  size?: number;
  className?: string;
}) {
  const s = SUBJECT[id] ?? { icon: BookOpen, bg: "var(--secondary)" };
  const Icon = s.icon;
  return (
    <span
      className={`inline-grid place-items-center flex-shrink-0 rounded-xl border-2 border-ink text-ink ${className}`}
      style={{ width: size, height: size, background: s.bg }}
      aria-hidden
    >
      <Icon style={{ width: size * 0.5, height: size * 0.5 }} strokeWidth={2.25} />
    </span>
  );
}

export function BadgeIcon({ id, earned, size = 56 }: { id: string; earned: boolean; size?: number }) {
  const Icon = BADGE[id] ?? Award;
  return (
    <span
      className={`inline-grid place-items-center rounded-full border-2 border-ink ${earned ? "bg-lime shadow-[3px_3px_0_var(--ink)]" : "bg-muted text-muted-foreground border-dashed"}`}
      style={{ width: size, height: size }}
      aria-hidden
    >
      <Icon style={{ width: size * 0.48, height: size * 0.48 }} strokeWidth={2.25} />
    </span>
  );
}
