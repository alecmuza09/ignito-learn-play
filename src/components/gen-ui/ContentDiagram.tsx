import { ArrowDown, ArrowRight, RotateCw } from "lucide-react";

export type DiagramVariant = "timeline" | "cycle" | "flow" | "compare";
export interface DiagramItem {
  label: string;
  detail?: string;
}

const TONES = ["bg-pink", "bg-lime", "bg-mint", "bg-sky", "bg-[#ffd27a]", "bg-[#d9c8ff]"];

/** Turns a long sentence into a short label + the rest as detail. */
export function itemsFromSteps(steps: string[]): DiagramItem[] {
  return steps
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => {
      const m = s.match(/^([^:]{3,48}?)\s*(?::|\s[—-]\s)\s*(.+)$/);
      return m ? { label: m[1].trim(), detail: m[2].trim() } : { label: s };
    });
}

/**
 * Diagram drawn from the lesson's own content: every label comes from the model,
 * so the picture always matches what is being explained.
 */
export function ContentDiagram({
  variant,
  title,
  caption,
  items,
  columns,
}: {
  variant: DiagramVariant;
  title?: string;
  caption?: string;
  items: DiagramItem[];
  columns?: { title: string; points: string[] }[];
}) {
  const list = items.slice(0, 8);
  return (
    <div className="rounded-3xl overflow-hidden bg-card sticker">
      {(title || caption) && (
        <div className="px-5 py-4 border-b-2 border-ink">
          {title && <h3 className="font-display text-xl leading-tight">{title}</h3>}
          {caption && <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{caption}</p>}
        </div>
      )}
      <div className="p-4 md:p-5 paper-grid">
        {variant === "timeline" && <Timeline items={list} />}
        {variant === "cycle" && <Cycle items={list} />}
        {variant === "flow" && <Flow items={list} />}
        {variant === "compare" && <Compare columns={columns ?? []} />}
      </div>
    </div>
  );
}

function Node({ i, item }: { i: number; item: DiagramItem }) {
  return (
    <div className={`rounded-2xl border-2 border-ink ${TONES[i % TONES.length]} px-3 py-2.5 shadow-[2px_2px_0_var(--ink)]`}>
      <div className="font-bold text-sm leading-snug">{item.label}</div>
      {item.detail && <div className="text-xs mt-1 leading-snug text-ink/80">{item.detail}</div>}
    </div>
  );
}

function Timeline({ items }: { items: DiagramItem[] }) {
  return (
    <ol className="relative space-y-4 pl-8">
      <span className="absolute left-[11px] top-2 bottom-2 w-1 rounded-full bg-ink" aria-hidden />
      {items.map((it, i) => (
        <li key={i} className="relative">
          <span className="absolute -left-8 top-2 grid h-6 w-6 place-items-center rounded-full border-2 border-ink bg-card font-display text-xs">
            {i + 1}
          </span>
          <Node i={i} item={it} />
        </li>
      ))}
    </ol>
  );
}

function Flow({ items }: { items: DiagramItem[] }) {
  return (
    <ol className="flex flex-col sm:flex-row sm:flex-wrap sm:items-stretch gap-2">
      {items.map((it, i) => (
        <li key={i} className="flex flex-col sm:flex-row items-center gap-2 sm:basis-[calc(50%-1.5rem)] sm:flex-1">
          <div className="w-full"><Node i={i} item={it} /></div>
          {i < items.length - 1 && (
            <>
              <ArrowDown className="h-5 w-5 sm:hidden flex-shrink-0" />
              <ArrowRight className="h-5 w-5 hidden sm:block flex-shrink-0" />
            </>
          )}
        </li>
      ))}
    </ol>
  );
}

function Cycle({ items }: { items: DiagramItem[] }) {
  // A closed loop: on wide screens items sit around a ring; on phones it is a list that loops back.
  const n = items.length;
  return (
    <>
      <div className="relative mx-auto hidden md:block aspect-square max-w-[460px]">
        <div className="absolute inset-[18%] rounded-full border-[3px] border-dashed border-ink/40" aria-hidden />
        <RotateCw className="absolute left-1/2 top-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2 text-ink/50" aria-hidden />
        {items.map((it, i) => {
          const a = (i / n) * Math.PI * 2 - Math.PI / 2;
          const x = 50 + Math.cos(a) * 36;
          const y = 50 + Math.sin(a) * 36;
          return (
            <div key={i} className="absolute w-[34%] -translate-x-1/2 -translate-y-1/2" style={{ left: `${x}%`, top: `${y}%` }}>
              <Node i={i} item={it} />
            </div>
          );
        })}
      </div>
      <ol className="md:hidden space-y-2">
        {items.map((it, i) => (
          <li key={i} className="flex flex-col items-center gap-2">
            <div className="w-full"><Node i={i} item={it} /></div>
            {i < n - 1 ? <ArrowDown className="h-5 w-5" /> : (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground"><RotateCw className="h-4 w-4" /> y vuelve a empezar</span>
            )}
          </li>
        ))}
      </ol>
    </>
  );
}

function Compare({ columns }: { columns: { title: string; points: string[] }[] }) {
  return (
    <div className={`grid gap-3 ${columns.length >= 3 ? "md:grid-cols-3" : "sm:grid-cols-2"}`}>
      {columns.slice(0, 3).map((c, i) => (
        <div key={i} className={`rounded-2xl border-2 border-ink ${TONES[i % TONES.length]} p-3 shadow-[2px_2px_0_var(--ink)]`}>
          <div className="font-display text-lg">{c.title}</div>
          <ul className="mt-2 space-y-1.5 text-sm">
            {c.points.slice(0, 5).map((p, j) => (
              <li key={j} className="flex gap-2"><span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-ink" />{p}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
