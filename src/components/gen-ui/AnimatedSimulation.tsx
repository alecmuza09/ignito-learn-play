import type { SimulationKind } from "@/lib/gen-blocks";

interface AnimatedSimulationProps {
  kind?: SimulationKind;
  title?: string;
  caption?: string;
  steps?: string[];
  compact?: boolean;
}

export function AnimatedSimulation({ kind = "generic", title, caption, steps, compact = false }: AnimatedSimulationProps) {
  const safeKind = kind === "generic" && title ? inferSimulationKind(title) : kind;
  return (
    <div className="rounded-3xl overflow-hidden bg-card border border-border shadow-soft">
      <div className="bg-muted/50 px-4 py-3 border-b border-border">
        {title && <h3 className="font-display text-lg font-bold leading-tight">{title}</h3>}
        {caption && <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed">{caption}</p>}
      </div>
      <div className={compact ? "p-3" : "p-4"}>
        <div className="rounded-2xl bg-secondary/70 overflow-hidden">
          {safeKind === "photosynthesis" && <PhotosynthesisSvg compact={compact} />}
          {safeKind === "waterCycle" && <WaterCycleSvg compact={compact} />}
          {safeKind === "fractionBar" && <FractionBarSvg compact={compact} />}
          {safeKind === "logicPath" && <LogicPathSvg compact={compact} />}
          {safeKind === "generic" && <GenericSvg compact={compact} />}
        </div>
        {!!steps?.length && (
          <div className="mt-3 grid grid-cols-2 gap-2">
            {steps.slice(0, 4).map((step, i) => (
              <div key={`${step}-${i}`} className="rounded-2xl bg-muted px-3 py-2 text-xs font-semibold leading-snug">
                <span className="inline-grid place-items-center w-5 h-5 rounded-lg bg-primary text-primary-foreground mr-1.5 text-[10px]">{i + 1}</span>
                {step}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function inferSimulationKind(text: string): SimulationKind {
  const t = text.toLowerCase();
  if (t.includes("fotos") || t.includes("photosynth") || t.includes("clorof") || t.includes("chloroph")) return "photosynthesis";
  if (t.includes("agua") || t.includes("water cycle") || t.includes("evapor") || t.includes("lluvia") || t.includes("rain")) return "waterCycle";
  if (t.includes("fracci") || t.includes("fraction") || t.includes("mitad") || t.includes("tercio")) return "fractionBar";
  if (t.includes("lógica") || t.includes("logica") || t.includes("logic") || t.includes("ruta") || t.includes("path")) return "logicPath";
  return "generic";
}

export function AnimatedVisualFallback({ prompt, title, compact = false }: { prompt?: string; title?: string; compact?: boolean }) {
  const kind = inferSimulationKind(`${title ?? ""} ${prompt ?? ""}`);
  return <AnimatedSimulation kind={kind} title={title} caption="Visual instantáneo mientras la IA prepara más detalle." compact={compact} />;
}

function PhotosynthesisSvg({ compact }: { compact: boolean }) {
  return (
    <svg viewBox="0 0 640 360" role="img" aria-label="Animación de fotosíntesis" className={compact ? "w-full aspect-[16/9]" : "w-full aspect-[16/9]"}>
      <rect width="640" height="360" fill="var(--secondary)" />
      <circle cx="88" cy="78" r="38" fill="var(--accent)">
        <animate attributeName="r" values="34;42;34" dur="2.8s" repeatCount="indefinite" />
      </circle>
      <g stroke="var(--accent)" strokeWidth="10" strokeLinecap="round" opacity="0.75">
        <line x1="88" y1="18" x2="88" y2="2" /><line x1="88" y1="154" x2="88" y2="138" />
        <line x1="28" y1="78" x2="12" y2="78" /><line x1="164" y1="78" x2="148" y2="78" />
        <animateTransform attributeName="transform" type="rotate" from="0 88 78" to="360 88 78" dur="12s" repeatCount="indefinite" />
      </g>
      <g stroke="var(--accent)" strokeWidth="8" strokeLinecap="round" fill="none">
        {[0, 1, 2].map((i) => (
          <path key={i} d={`M${132 + i * 28} ${106 + i * 12} C220 ${130 + i * 10}, 276 ${160 + i * 8}, 322 ${205}`} opacity="0.7">
            <animate attributeName="stroke-dasharray" values="1 240;90 240;1 240" dur="2.6s" begin={`${i * 0.35}s`} repeatCount="indefinite" />
            <animate attributeName="stroke-dashoffset" values="240;0" dur="2.6s" begin={`${i * 0.35}s`} repeatCount="indefinite" />
          </path>
        ))}
      </g>
      <path d="M316 300 C310 245 320 205 344 166" stroke="var(--mint-foreground)" strokeWidth="18" strokeLinecap="round" fill="none" />
      <ellipse cx="295" cy="208" rx="72" ry="34" fill="var(--mint)" transform="rotate(-28 295 208)">
        <animateTransform attributeName="transform" type="rotate" values="-32 295 208;-22 295 208;-32 295 208" dur="3s" repeatCount="indefinite" />
      </ellipse>
      <ellipse cx="382" cy="204" rx="78" ry="36" fill="var(--mint)" transform="rotate(24 382 204)">
        <animateTransform attributeName="transform" type="rotate" values="20 382 204;31 382 204;20 382 204" dur="3.2s" repeatCount="indefinite" />
      </ellipse>
      <ellipse cx="340" cy="158" rx="66" ry="32" fill="var(--primary-glow)" transform="rotate(-5 340 158)" opacity="0.9" />
      <rect x="240" y="304" width="210" height="28" rx="14" fill="var(--accent)" opacity="0.45" />
      <g fill="var(--sky-foreground)">
        {[0, 1, 2].map((i) => <text key={i} x={470 + i * 34} y={90 + i * 44} fontSize="24" fontWeight="700">CO₂</text>)}
        <animateTransform attributeName="transform" type="translate" values="40 0;0 35;40 0" dur="4s" repeatCount="indefinite" />
      </g>
      <g fill="var(--sky)">
        {[0, 1, 2].map((i) => <circle key={i} cx={276 + i * 35} cy={326 - i * 8} r={10 + i * 2} />)}
        <animateTransform attributeName="transform" type="translate" values="0 16;0 -18;0 16" dur="2.7s" repeatCount="indefinite" />
      </g>
      <g fill="var(--primary)" fontSize="28" fontWeight="800">
        <text x="455" y="250">O₂</text><text x="500" y="285">O₂</text>
        <animateTransform attributeName="transform" type="translate" values="0 20;34 -42;0 20" dur="3.5s" repeatCount="indefinite" />
      </g>
    </svg>
  );
}

function WaterCycleSvg({ compact }: { compact: boolean }) {
  return (
    <svg viewBox="0 0 640 360" role="img" aria-label="Animación del ciclo del agua" className={compact ? "w-full aspect-[16/9]" : "w-full aspect-[16/9]"}>
      <rect width="640" height="360" fill="var(--secondary)" />
      <path d="M0 292 C120 252 206 322 326 286 C450 248 520 302 640 270 L640 360 L0 360Z" fill="var(--sky)" opacity="0.75" />
      <path d="M152 244 C190 160 232 106 318 118 C404 130 446 182 492 238" fill="var(--mint)" opacity="0.65" />
      <ellipse cx="365" cy="88" rx="115" ry="42" fill="var(--card)" opacity="0.95">
        <animate attributeName="cx" values="345;382;345" dur="5s" repeatCount="indefinite" />
      </ellipse>
      <g stroke="var(--sky-foreground)" strokeWidth="7" strokeLinecap="round">
        {[0, 1, 2, 3].map((i) => <line key={i} x1={310 + i * 36} y1="130" x2={292 + i * 36} y2="176" opacity="0.65" />)}
        <animateTransform attributeName="transform" type="translate" values="0 -8;0 18;0 -8" dur="1.2s" repeatCount="indefinite" />
      </g>
      <path d="M168 272 C142 205 155 160 200 122" stroke="var(--accent)" strokeWidth="9" fill="none" strokeLinecap="round" strokeDasharray="18 18">
        <animate attributeName="stroke-dashoffset" values="80;0" dur="1.8s" repeatCount="indefinite" />
      </path>
      <path d="M464 236 C520 196 518 142 454 104" stroke="var(--primary)" strokeWidth="9" fill="none" strokeLinecap="round" strokeDasharray="18 18">
        <animate attributeName="stroke-dashoffset" values="0;80" dur="2.2s" repeatCount="indefinite" />
      </path>
    </svg>
  );
}

function FractionBarSvg({ compact }: { compact: boolean }) {
  return (
    <svg viewBox="0 0 640 360" role="img" aria-label="Animación de fracciones" className={compact ? "w-full aspect-[16/9]" : "w-full aspect-[16/9]"}>
      <rect width="640" height="360" fill="var(--secondary)" />
      {[0, 1, 2, 3, 4].map((i) => (
        <rect key={i} x={100 + i * 88} y="130" width="80" height="96" rx="16" fill={i < 3 ? "var(--primary)" : "var(--card)"} stroke="var(--border)" strokeWidth="4">
          {i < 3 && <animate attributeName="y" values="130;112;130" dur="2s" begin={`${i * 0.18}s`} repeatCount="indefinite" />}
        </rect>
      ))}
      <text x="260" y="286" fill="var(--foreground)" fontSize="44" fontWeight="800">3/5</text>
    </svg>
  );
}

function LogicPathSvg({ compact }: { compact: boolean }) {
  return (
    <svg viewBox="0 0 640 360" role="img" aria-label="Animación de ruta lógica" className={compact ? "w-full aspect-[16/9]" : "w-full aspect-[16/9]"}>
      <rect width="640" height="360" fill="var(--secondary)" />
      <path d="M96 180 H238 C278 180 278 98 330 98 C382 98 390 180 444 180 H544" stroke="var(--border)" strokeWidth="20" strokeLinecap="round" fill="none" />
      <path d="M96 180 H238 C278 180 278 98 330 98 C382 98 390 180 444 180 H544" stroke="var(--primary)" strokeWidth="10" strokeLinecap="round" fill="none" strokeDasharray="36 28">
        <animate attributeName="stroke-dashoffset" values="260;0" dur="2.6s" repeatCount="indefinite" />
      </path>
      {[96, 330, 544].map((x, i) => <circle key={x} cx={x} cy={i === 1 ? 98 : 180} r="28" fill={i === 1 ? "var(--accent)" : "var(--mint)"} stroke="var(--card)" strokeWidth="8" />)}
      <circle cx="96" cy="180" r="10" fill="var(--primary-foreground)">
        <animateMotion dur="3.2s" repeatCount="indefinite" path="M0 0 H142 C182 0 182 -82 234 -82 C286 -82 294 0 348 0 H448" />
      </circle>
    </svg>
  );
}

function GenericSvg({ compact }: { compact: boolean }) {
  return (
    <svg viewBox="0 0 640 360" role="img" aria-label="Animación generativa" className={compact ? "w-full aspect-[16/9]" : "w-full aspect-[16/9]"}>
      <rect width="640" height="360" fill="var(--secondary)" />
      {[0, 1, 2, 3].map((i) => (
        <circle key={i} cx={170 + i * 90} cy={180} r={34 + i * 4} fill={i % 2 ? "var(--accent)" : "var(--primary)"} opacity="0.72">
          <animate attributeName="cy" values={`${180};${130 + i * 14};${180}`} dur={`${2.4 + i * 0.25}s`} repeatCount="indefinite" />
        </circle>
      ))}
      <path d="M150 238 C236 282 372 82 496 130" stroke="var(--mint-foreground)" strokeWidth="10" strokeLinecap="round" fill="none" strokeDasharray="20 16">
        <animate attributeName="stroke-dashoffset" values="100;0" dur="2s" repeatCount="indefinite" />
      </path>
    </svg>
  );
}