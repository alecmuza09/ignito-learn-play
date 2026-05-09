import type { SimulationKind } from "@/lib/gen-blocks";

interface AnimatedSimulationProps {
  kind?: SimulationKind;
  title?: string;
  caption?: string;
  steps?: string[];
  compact?: boolean;
  hint?: string;
}

export function AnimatedSimulation({ kind = "generic", title, caption, steps, compact = false, hint }: AnimatedSimulationProps) {
  const safeKind = kind === "generic"
    ? inferSimulationKind(`${title ?? ""} ${caption ?? ""} ${hint ?? ""} ${(steps ?? []).join(" ")}`)
    : kind;
  return (
    <div className="rounded-3xl overflow-hidden bg-card border border-border shadow-soft">
      {(title || caption) && (
        <div className="bg-muted/50 px-4 py-3 border-b border-border">
          {title && <h3 className="font-display text-lg font-bold leading-tight">{title}</h3>}
          {caption && <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed">{caption}</p>}
        </div>
      )}
      <div className={compact ? "p-3" : "p-4"}>
        <div className="rounded-2xl overflow-hidden">
          <SimSvg kind={safeKind} compact={compact} />
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

function SimSvg({ kind, compact }: { kind: SimulationKind; compact: boolean }) {
  switch (kind) {
    case "photosynthesis":  return <PhotosynthesisSvg compact={compact} />;
    case "waterCycle":      return <WaterCycleSvg compact={compact} />;
    case "fractionBar":     return <FractionBarSvg compact={compact} />;
    case "logicPath":       return <LogicPathSvg compact={compact} />;
    case "solarSystem":     return <SolarSystemSvg compact={compact} />;
    case "heart":           return <HeartSvg compact={compact} />;
    case "atom":            return <AtomSvg compact={compact} />;
    case "ecosystem":       return <EcosystemSvg compact={compact} />;
    case "foodChain":       return <FoodChainSvg compact={compact} />;
    case "circuit":         return <CircuitSvg compact={compact} />;
    case "magnet":          return <MagnetSvg compact={compact} />;
    case "gravity":         return <GravitySvg compact={compact} />;
    case "dna":             return <DnaSvg compact={compact} />;
    case "volcano":         return <VolcanoSvg compact={compact} />;
    case "geometry":        return <GeometrySvg compact={compact} />;
    case "multiplication":  return <MultiplicationSvg compact={compact} />;
    case "alphabet":        return <AlphabetSvg compact={compact} />;
    case "timeline":        return <TimelineSvg compact={compact} />;
    case "musicNotes":      return <MusicNotesSvg compact={compact} />;
    case "lifeCycle":       return <LifeCycleSvg compact={compact} />;
    case "weather":         return <WeatherSvg compact={compact} />;
    case "rocket":          return <RocketSvg compact={compact} />;
    case "wave":            return <WaveSvg compact={compact} />;
    case "digestion":       return <DigestionSvg compact={compact} />;
    case "respiration":     return <RespirationSvg compact={compact} />;
    case "seasons":         return <SeasonsSvg compact={compact} />;
    case "phaseChange":     return <PhaseChangeSvg compact={compact} />;
    case "pendulum":        return <PendulumSvg compact={compact} />;
    case "additionBlocks":  return <AdditionBlocksSvg compact={compact} />;
    case "mapRoute":        return <MapRouteSvg compact={compact} />;
    default:                return <GenericSvg compact={compact} />;
  }
}

const KIND_KEYWORDS: { kind: SimulationKind; words: string[] }[] = [
  { kind: "photosynthesis", words: ["fotos", "photosynth", "clorof", "chloroph", "hojas", "leaf"] },
  { kind: "waterCycle",     words: ["ciclo del agua", "water cycle", "evapor", "lluvia", "rain", "precip", "condensa"] },
  { kind: "weather",        words: ["clima", "tiempo atmosf", "weather", "tormenta", "storm", "nube", "cloud"] },
  { kind: "seasons",        words: ["estacion", "season", "primavera", "verano", "otoño", "invierno", "tierra inclin"] },
  { kind: "phaseChange",    words: ["estado", "sólido", "solido", "líquido", "liquido", "gas", "phase", "fusión", "ebullic"] },
  { kind: "fractionBar",    words: ["fracci", "fraction", "mitad", "tercio", "cuarto", "porcent", "percent"] },
  { kind: "multiplication", words: ["multiplica", "multiply", "tabla", "times table", "producto", "divisi", "divid"] },
  { kind: "additionBlocks", words: ["sumar", "suma ", "addition", "restar", "resta ", "subtract", "más ", "menos "] },
  { kind: "geometry",       words: ["geometr", "triáng", "triangle", "círcul", "circle", "cuadrad", "square", "área", "perímetr", "polígon"] },
  { kind: "logicPath",      words: ["lógica", "logica", "logic", "ruta", "algoritm", "if then", "secuencia", "código", "programa"] },
  { kind: "mapRoute",       words: ["mapa", "map ", "geograf", "ubicac", "coordenad", "ruta", "país", "continent"] },
  { kind: "solarSystem",    words: ["solar", "planeta", "planet", "sol ", "sun ", "luna", "moon", "órbita", "orbit", "espacio", "space", "saturno", "júpiter"] },
  { kind: "rocket",         words: ["cohete", "rocket", "nave", "spaceship", "lanzamient", "launch", "astronauta"] },
  { kind: "heart",          words: ["coraz", "heart", "sangre", "blood", "circul", "vena", "vein", "arteri", "pulso", "pulse"] },
  { kind: "respiration",    words: ["pulm", "lung", "respira", "breath", "oxígeno", "oxygen", "inhal", "exhal"] },
  { kind: "digestion",      words: ["digest", "estómago", "estomago", "stomach", "intestin", "comida", "alimento"] },
  { kind: "atom",           words: ["átom", "atom", "molec", "neutron", "electron", "protón", "químic", "chemistry", "elemento quím"] },
  { kind: "dna",            words: ["adn", "dna", "gen ", "genét", "genetic", "cromos", "chromos", "hereda", "herenc"] },
  { kind: "ecosystem",      words: ["ecosistem", "ecosystem", "selva", "bosque", "forest", "habitat", "biodivers", "naturale"] },
  { kind: "foodChain",      words: ["cadena alim", "food chain", "depredador", "predator", "presa", "prey", "carnívor", "herbívor"] },
  { kind: "lifeCycle",      words: ["ciclo de vida", "life cycle", "metamorf", "mariposa", "butterfly", "rana", "frog", "huevo", "larva"] },
  { kind: "circuit",        words: ["circuit", "electric", "voltaj", "voltage", "corriente", "current", "bombilla", "bulb", "bater"] },
  { kind: "magnet",         words: ["imán", "iman", "magnet", "polo norte", "polo sur", "campo magnét"] },
  { kind: "gravity",        words: ["graved", "gravity", "caída", "newton", "manzana cae", "fuerza"] },
  { kind: "pendulum",       words: ["péndulo", "pendulo", "pendulum", "oscila", "reloj", "clock", "tiempo medi"] },
  { kind: "volcano",        words: ["volcán", "volcan", "lava", "magma", "erupci"] },
  { kind: "alphabet",       words: ["alfabeto", "alphabet", "letras", "abc ", "vocal", "consonante", "sílab"] },
  { kind: "timeline",       words: ["historia", "history", "línea de tiempo", "timeline", "siglo", "century", "edad media", "antiguo"] },
  { kind: "musicNotes",     words: ["música", "music", "nota musical", "ritmo", "rhythm", "melod", "instrumento"] },
  { kind: "wave",           words: ["onda", "wave", "sonido", "sound", "frecuencia", "vibración"] },
];

export function inferSimulationKind(text: string): SimulationKind {
  const t = text.toLowerCase();
  for (const { kind, words } of KIND_KEYWORDS) {
    if (words.some((w) => t.includes(w))) return kind;
  }
  return "generic";
}

export function AnimatedVisualFallback({ prompt, title, compact = false }: { prompt?: string; title?: string; compact?: boolean }) {
  const kind = inferSimulationKind(`${title ?? ""} ${prompt ?? ""}`);
  return <AnimatedSimulation kind={kind} title={title} caption="Visual instantáneo mientras la IA prepara más detalle." compact={compact} hint={prompt} />;
}

export function QuizMotif({ text, className = "" }: { text: string; className?: string }) {
  const kind = inferSimulationKind(text);
  return (
    <div className={`rounded-2xl overflow-hidden ${className}`}>
      <SimSvg kind={kind} compact />
    </div>
  );
}

/* ============== shared utilities ============== */

const VB = "0 0 640 360";
const ASPECT = "w-full aspect-[16/9]";

/** Soft gradient background + ambient sparkles, used by every scene. */
function SceneBG({ id, from = "var(--secondary)", to = "var(--card)", sparkles = 0, sparkleColor = "var(--primary)" }: {
  id: string; from?: string; to?: string; sparkles?: number; sparkleColor?: string;
}) {
  const dots = Array.from({ length: sparkles }, (_, i) => ({
    cx: (i * 71 + 23) % 620 + 10,
    cy: (i * 53 + 19) % 340 + 10,
    r: 1 + (i % 3) * 0.7,
    d: 2 + (i % 5) * 0.4,
  }));
  return (
    <>
      <defs>
        <linearGradient id={`bg-${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={from} />
          <stop offset="100%" stopColor={to} />
        </linearGradient>
        <radialGradient id={`glow-${id}`} cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="var(--primary-glow, var(--primary))" stopOpacity="0.18" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
      </defs>
      <rect width="640" height="360" fill={`url(#bg-${id})`} />
      <rect width="640" height="360" fill={`url(#glow-${id})`} />
      {dots.map((p, i) => (
        <circle key={i} cx={p.cx} cy={p.cy} r={p.r} fill={sparkleColor} opacity="0.4">
          <animate attributeName="opacity" values="0.15;0.7;0.15" dur={`${p.d}s`} begin={`${i * 0.13}s`} repeatCount="indefinite" />
        </circle>
      ))}
    </>
  );
}

function Label({ x, y, text, fill = "var(--foreground)", size = 13, delay = 0, anchor = "middle" }: {
  x: number; y: number; text: string; fill?: string; size?: number; delay?: number; anchor?: "start" | "middle" | "end";
}) {
  return (
    <text x={x} y={y} fontSize={size} fontWeight="700" textAnchor={anchor} fill={fill} opacity="0">
      {text}
      <animate attributeName="opacity" values="0;1" dur="0.6s" begin={`${delay}s`} fill="freeze" />
    </text>
  );
}

/* ============== individual scenes ============== */

function PhotosynthesisSvg({ compact: _c }: { compact: boolean }) {
  return (
    <svg viewBox={VB} role="img" aria-label="Fotosíntesis" className={ASPECT}>
      <SceneBG id="photo" from="#FEF6E4" to="#E6F4EA" sparkles={14} sparkleColor="var(--accent)" />
      {/* sun with rotating rays */}
      <g>
        <circle cx="92" cy="78" r="36" fill="var(--accent)">
          <animate attributeName="r" values="32;42;32" dur="2.8s" repeatCount="indefinite" />
        </circle>
        <g stroke="var(--accent)" strokeWidth="6" strokeLinecap="round" opacity="0.85">
          {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => {
            const r1 = 46, r2 = 62;
            const rad = (a * Math.PI) / 180;
            return <line key={a} x1={92 + Math.cos(rad) * r1} y1={78 + Math.sin(rad) * r1} x2={92 + Math.cos(rad) * r2} y2={78 + Math.sin(rad) * r2} />;
          })}
          <animateTransform attributeName="transform" type="rotate" from="0 92 78" to="360 92 78" dur="14s" repeatCount="indefinite" />
        </g>
      </g>
      {/* ground */}
      <path d="M0 300 H640 V360 H0Z" fill="var(--mint)" opacity="0.6" />
      <path d="M0 300 C160 290 480 312 640 296 L640 300 L0 300Z" fill="var(--mint-foreground)" opacity="0.25" />
      {/* roots */}
      <g stroke="var(--coral-foreground)" strokeWidth="4" strokeLinecap="round" fill="none" opacity="0.55">
        <path d="M324 304 C320 320 305 332 290 340" />
        <path d="M324 304 C328 320 345 330 360 338" />
        <path d="M324 304 L324 348" />
      </g>
      {/* stem with rising water drops */}
      <path d="M324 300 C320 245 328 205 344 168" stroke="var(--mint-foreground)" strokeWidth="14" strokeLinecap="round" fill="none" />
      {[0, 1, 2].map((i) => (
        <circle key={i} cx="322" cy="300" r="4" fill="var(--sky-foreground)">
          <animate attributeName="cy" values="300;170" dur="3s" begin={`${i * 1}s`} repeatCount="indefinite" />
          <animate attributeName="opacity" values="0;1;1;0" dur="3s" begin={`${i * 1}s`} repeatCount="indefinite" />
        </circle>
      ))}
      {/* leaves */}
      <ellipse cx="295" cy="208" rx="64" ry="30" fill="var(--mint)" stroke="var(--mint-foreground)" strokeWidth="3" transform="rotate(-28 295 208)">
        <animateTransform attributeName="transform" type="rotate" values="-32 295 208;-22 295 208;-32 295 208" dur="3s" repeatCount="indefinite" />
      </ellipse>
      <ellipse cx="382" cy="204" rx="70" ry="32" fill="var(--mint)" stroke="var(--mint-foreground)" strokeWidth="3" transform="rotate(24 382 204)">
        <animateTransform attributeName="transform" type="rotate" values="20 382 204;31 382 204;20 382 204" dur="3.2s" repeatCount="indefinite" />
      </ellipse>
      <ellipse cx="340" cy="158" rx="58" ry="28" fill="var(--primary-glow)" stroke="var(--mint-foreground)" strokeWidth="3" opacity="0.95" />
      {/* light rays into leaves */}
      <g stroke="var(--accent)" strokeWidth="6" strokeLinecap="round" fill="none" opacity="0.7">
        {[0, 1, 2].map((i) => (
          <path key={i} d={`M${134 + i * 22} ${108 + i * 10} C220 ${130 + i * 8}, 276 ${160 + i * 6}, 322 200`}>
            <animate attributeName="stroke-dasharray" values="1 240;90 240;1 240" dur="2.6s" begin={`${i * 0.35}s`} repeatCount="indefinite" />
            <animate attributeName="stroke-dashoffset" values="240;0" dur="2.6s" begin={`${i * 0.35}s`} repeatCount="indefinite" />
          </path>
        ))}
      </g>
      {/* CO2 in */}
      <g>
        {[0, 1].map((i) => (
          <g key={i}>
            <text x={500 - i * 30} y={130 + i * 50} fontSize="22" fontWeight="800" fill="var(--sky-foreground)">CO₂</text>
            <animateTransform attributeName="transform" type="translate" values="40 0;-130 0;40 0" dur={`${4 + i * 0.5}s`} begin={`${i * 0.5}s`} repeatCount="indefinite" />
          </g>
        ))}
      </g>
      {/* O2 + glucose out */}
      <g>
        <text x="455" y="240" fontSize="24" fontWeight="800" fill="var(--primary)">O₂</text>
        <text x="500" y="270" fontSize="24" fontWeight="800" fill="var(--primary)">O₂</text>
        <animateTransform attributeName="transform" type="translate" values="0 20;36 -50;0 20" dur="3.5s" repeatCount="indefinite" />
      </g>
      <g>
        <circle cx="280" cy="270" r="8" fill="var(--coral)" />
        <circle cx="295" cy="276" r="8" fill="var(--coral)" />
        <circle cx="310" cy="270" r="8" fill="var(--coral)" />
        <animateTransform attributeName="transform" type="translate" values="0 0;0 -10;0 0" dur="2s" repeatCount="indefinite" />
      </g>
      <Label x={92} y={128} text="Sol" fill="var(--accent-foreground, var(--foreground))" delay={0.3} />
      <Label x={490} y={155} text="CO₂" fill="var(--sky-foreground)" delay={0.6} size={11} />
      <Label x={478} y={258} text="O₂" fill="var(--primary)" delay={0.9} size={11} />
      <Label x={295} y={300} text="Glucosa" fill="var(--coral-foreground, var(--foreground))" delay={1.2} size={11} />
    </svg>
  );
}

function WaterCycleSvg({ compact: _c }: { compact: boolean }) {
  return (
    <svg viewBox={VB} role="img" aria-label="Ciclo del agua" className={ASPECT}>
      <SceneBG id="wc" from="#E0F2FE" to="#F0F9FF" sparkles={10} sparkleColor="var(--sky-foreground)" />
      {/* sun */}
      <circle cx="80" cy="70" r="28" fill="var(--accent)">
        <animate attributeName="r" values="26;32;26" dur="3s" repeatCount="indefinite" />
      </circle>
      {/* mountain */}
      <path d="M152 244 C190 160 232 106 318 118 C404 130 446 182 492 238" fill="var(--mint)" stroke="var(--mint-foreground)" strokeWidth="3" opacity="0.8" />
      {/* water/sea */}
      <path d="M0 292 C120 252 206 322 326 286 C450 248 520 302 640 270 L640 360 L0 360Z" fill="var(--sky)" opacity="0.85" />
      {/* river flowing */}
      <path d="M340 200 C360 230 380 260 360 290" stroke="var(--sky-foreground)" strokeWidth="6" fill="none" strokeLinecap="round" strokeDasharray="10 8">
        <animate attributeName="stroke-dashoffset" values="36;0" dur="1.4s" repeatCount="indefinite" />
      </path>
      {/* cloud */}
      <g>
        <ellipse cx="365" cy="88" rx="80" ry="28" fill="var(--card)" />
        <ellipse cx="335" cy="80" rx="40" ry="22" fill="var(--card)" />
        <ellipse cx="395" cy="80" rx="45" ry="22" fill="var(--card)" />
        <animateTransform attributeName="transform" type="translate" values="-20 0;20 0;-20 0" dur="6s" repeatCount="indefinite" />
      </g>
      {/* rain drops */}
      <g fill="var(--sky-foreground)">
        {[0, 1, 2, 3, 4].map((i) => (
          <path key={i} d={`M${320 + i * 20} 120 q-3 8 0 12 q3 -4 0 -12 z`}>
            <animate attributeName="d" values={`M${320 + i * 20} 120 q-3 8 0 12 q3 -4 0 -12 z;M${320 + i * 20} 200 q-3 8 0 12 q3 -4 0 -12 z`} dur="1.2s" begin={`${i * 0.2}s`} repeatCount="indefinite" />
            <animate attributeName="opacity" values="1;1;0" dur="1.2s" begin={`${i * 0.2}s`} repeatCount="indefinite" />
          </path>
        ))}
      </g>
      {/* evaporation arrow up (left) */}
      <path d="M168 272 C142 205 155 160 200 122" stroke="var(--accent)" strokeWidth="7" fill="none" strokeLinecap="round" strokeDasharray="14 12">
        <animate attributeName="stroke-dashoffset" values="80;0" dur="1.8s" repeatCount="indefinite" />
      </path>
      <polygon points="194,118 210,124 200,134" fill="var(--accent)" />
      {/* runoff arrow down (right) */}
      <path d="M464 236 C520 196 518 142 454 104" stroke="var(--primary)" strokeWidth="7" fill="none" strokeLinecap="round" strokeDasharray="14 12">
        <animate attributeName="stroke-dashoffset" values="0;80" dur="2.2s" repeatCount="indefinite" />
      </path>
      {/* steam wisps from water */}
      {[0, 1, 2].map((i) => (
        <ellipse key={i} cx={80 + i * 60} cy="290" rx="14" ry="6" fill="var(--card)" opacity="0">
          <animate attributeName="cy" values="290;240;200" dur="3s" begin={`${i * 0.6}s`} repeatCount="indefinite" />
          <animate attributeName="opacity" values="0;0.7;0" dur="3s" begin={`${i * 0.6}s`} repeatCount="indefinite" />
        </ellipse>
      ))}
      <Label x={210} y={108} text="Evaporación" delay={0.2} size={11} />
      <Label x={365} y={64} text="Condensación" delay={0.5} size={11} fill="var(--foreground)" />
      <Label x={350} y={140} text="Lluvia" delay={0.8} size={11} fill="var(--sky-foreground)" />
      <Label x={520} y={310} text="Recolección" delay={1.1} size={11} fill="var(--sky-foreground)" />
    </svg>
  );
}

function FractionBarSvg({ compact: _c }: { compact: boolean }) {
  return (
    <svg viewBox={VB} role="img" aria-label="Fracciones" className={ASPECT}>
      <SceneBG id="frac" from="#FFF1F2" to="#FCE7F3" sparkles={6} sparkleColor="var(--primary)" />
      {[0, 1, 2, 3, 4].map((i) => (
        <g key={i}>
          <rect x={100 + i * 88} y="130" width="80" height="100" rx="14" fill={i < 3 ? "var(--primary)" : "var(--card)"} stroke="var(--border)" strokeWidth="3">
            {i < 3 && <animate attributeName="y" values="130;112;130" dur="2s" begin={`${i * 0.18}s`} repeatCount="indefinite" />}
          </rect>
          <text x={140 + i * 88} y="186" textAnchor="middle" fontSize="22" fontWeight="800" fill={i < 3 ? "var(--primary-foreground)" : "var(--muted-foreground)"}>1/5</text>
        </g>
      ))}
      <text x="320" y="290" textAnchor="middle" fill="var(--foreground)" fontSize="40" fontWeight="800">3 / 5</text>
      <Label x={320} y={108} text="3 partes pintadas de 5" delay={0.4} size={13} />
    </svg>
  );
}

function LogicPathSvg({ compact: _c }: { compact: boolean }) {
  return (
    <svg viewBox={VB} role="img" aria-label="Ruta lógica" className={ASPECT}>
      <SceneBG id="logic" from="#EEF2FF" to="#F5F3FF" sparkles={8} sparkleColor="var(--primary)" />
      <path d="M96 200 H238 C278 200 278 110 330 110 C382 110 390 200 444 200 H544" stroke="var(--border)" strokeWidth="20" strokeLinecap="round" fill="none" />
      <path d="M96 200 H238 C278 200 278 110 330 110 C382 110 390 200 444 200 H544" stroke="var(--primary)" strokeWidth="10" strokeLinecap="round" fill="none" strokeDasharray="36 28">
        <animate attributeName="stroke-dashoffset" values="260;0" dur="2.6s" repeatCount="indefinite" />
      </path>
      {[{x:96,y:200,c:"var(--mint)",l:"INICIO"},{x:330,y:110,c:"var(--accent)",l:"SI?"},{x:544,y:200,c:"var(--mint)",l:"FIN"}].map((n, i) => (
        <g key={i}>
          <circle cx={n.x} cy={n.y} r="30" fill={n.c} stroke="var(--card)" strokeWidth="6" />
          <text x={n.x} y={n.y + 5} textAnchor="middle" fontSize="11" fontWeight="800" fill="var(--card)">{n.l}</text>
        </g>
      ))}
      <circle cx="96" cy="200" r="9" fill="var(--primary-foreground)">
        <animateMotion dur="3.2s" repeatCount="indefinite" path="M0 0 H142 C182 0 182 -90 234 -90 C286 -90 294 0 348 0 H448" />
      </circle>
    </svg>
  );
}

function SolarSystemSvg({ compact: _c }: { compact: boolean }) {
  const orbits = [{ r: 60, c: "var(--primary)", d: 5, name: "Mercurio" }, { r: 100, c: "var(--accent)", d: 8, name: "Venus" }, { r: 140, c: "var(--sky-foreground)", d: 12, name: "Tierra" }, { r: 180, c: "var(--coral)", d: 16, name: "Marte" }];
  return (
    <svg viewBox={VB} role="img" aria-label="Sistema solar" className={ASPECT}>
      <SceneBG id="solar" from="#0F172A" to="#1E1B4B" sparkles={50} sparkleColor="#FFFFFF" />
      <circle cx="320" cy="180" r="34" fill="var(--accent)">
        <animate attributeName="r" values="32;38;32" dur="3s" repeatCount="indefinite" />
      </circle>
      <circle cx="320" cy="180" r="48" fill="var(--accent)" opacity="0.25">
        <animate attributeName="r" values="44;58;44" dur="3s" repeatCount="indefinite" />
      </circle>
      {orbits.map((o, i) => (
        <g key={i}>
          <ellipse cx="320" cy="180" rx={o.r} ry={o.r * 0.95} fill="none" stroke="#FFFFFF" strokeOpacity="0.18" strokeWidth="1.5" strokeDasharray="3 5" />
          <g>
            <circle r={i === 2 ? 12 : i === 3 ? 9 : 7} fill={o.c}>
              <animateMotion dur={`${o.d}s`} repeatCount="indefinite" path={`M${o.r} 0 A${o.r} ${o.r * 0.95} 0 1 1 ${-o.r} 0 A${o.r} ${o.r * 0.95} 0 1 1 ${o.r} 0`} />
            </circle>
            {i === 2 && (
              <circle r="3" fill="#E5E7EB">
                <animateMotion dur={`${o.d * 0.3}s`} repeatCount="indefinite" path={`M${o.r + 15} 0 A15 14 0 1 1 ${o.r - 15} 0 A15 14 0 1 1 ${o.r + 15} 0`} />
              </circle>
            )}
            <animateTransform attributeName="transform" type="translate" values="320 180;320 180" />
          </g>
        </g>
      ))}
      {/* Saturn-like ring around the sun for flair */}
      <ellipse cx="320" cy="180" rx="220" ry="40" fill="none" stroke="var(--coral)" strokeOpacity="0.3" strokeWidth="3" transform="rotate(-15 320 180)" />
    </svg>
  );
}

function HeartSvg({ compact: _c }: { compact: boolean }) {
  return (
    <svg viewBox={VB} role="img" aria-label="Corazón latiendo" className={ASPECT}>
      <SceneBG id="heart" from="#FEE2E2" to="#FFF1F2" sparkles={6} sparkleColor="var(--coral)" />
      <g transform="translate(220 70)">
        <g>
          <path d="M100 180 C30 130 30 60 90 50 C120 45 140 70 150 90 C160 70 180 45 210 50 C270 60 270 130 200 180 L150 220 Z" fill="var(--coral)" stroke="var(--coral-foreground)" strokeWidth="5" />
          {/* chambers */}
          <line x1="150" y1="90" x2="150" y2="200" stroke="var(--coral-foreground)" strokeWidth="2" opacity="0.5" />
          <line x1="80" y1="120" x2="220" y2="120" stroke="var(--coral-foreground)" strokeWidth="2" opacity="0.5" />
          <text x="105" y="110" fontSize="11" fontWeight="700" fill="var(--coral-foreground)" textAnchor="middle" opacity="0.7">AD</text>
          <text x="195" y="110" fontSize="11" fontWeight="700" fill="var(--coral-foreground)" textAnchor="middle" opacity="0.7">AI</text>
          <text x="115" y="170" fontSize="11" fontWeight="700" fill="var(--coral-foreground)" textAnchor="middle" opacity="0.7">VD</text>
          <text x="185" y="170" fontSize="11" fontWeight="700" fill="var(--coral-foreground)" textAnchor="middle" opacity="0.7">VI</text>
          <animateTransform attributeName="transform" type="scale" values="1;1.08;1;1.08;1" dur="1.4s" repeatCount="indefinite" additive="sum" />
        </g>
        {/* arrows */}
        <g stroke="var(--sky-foreground)" strokeWidth="3" fill="none" strokeLinecap="round">
          <path d="M60 70 C40 60 40 30 70 20" markerEnd="url(#arrow-heart)" />
        </g>
      </g>
      <defs>
        <marker id="arrow-heart" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--sky-foreground)" />
        </marker>
      </defs>
      {/* ECG */}
      <path d="M40 320 L140 320 L170 260 L200 350 L230 290 L260 320 L600 320" stroke="var(--border)" strokeWidth="3" fill="none" />
      <path d="M40 320 L140 320 L170 260 L200 350 L230 290 L260 320 L600 320" stroke="var(--primary)" strokeWidth="5" fill="none" strokeLinecap="round" strokeDasharray="8 800">
        <animate attributeName="stroke-dashoffset" values="0;-808" dur="2.8s" repeatCount="indefinite" />
      </path>
    </svg>
  );
}

function AtomSvg({ compact: _c }: { compact: boolean }) {
  return (
    <svg viewBox={VB} role="img" aria-label="Átomo" className={ASPECT}>
      <SceneBG id="atom" from="#EFF6FF" to="#F5F3FF" sparkles={8} sparkleColor="var(--primary)" />
      <g transform="translate(320 180)">
        {/* electron cloud */}
        <circle r="170" fill="var(--primary)" opacity="0.06" />
        <circle r="120" fill="var(--primary)" opacity="0.08" />
        {[0, 60, 120].map((deg, i) => (
          <g key={i} transform={`rotate(${deg})`}>
            <ellipse cx="0" cy="0" rx="150" ry="55" fill="none" stroke="var(--border)" strokeWidth="2" strokeDasharray="4 4" />
            <g>
              <circle r="9" fill={i === 0 ? "var(--primary)" : i === 1 ? "var(--accent)" : "var(--mint-foreground)"}>
                <animateMotion dur={`${2.5 + i * 0.4}s`} repeatCount="indefinite" path="M150 0 A150 55 0 1 1 -150 0 A150 55 0 1 1 150 0" />
              </circle>
            </g>
          </g>
        ))}
        {/* nucleus */}
        <circle r="28" fill="var(--accent)" opacity="0.4">
          <animate attributeName="r" values="26;32;26" dur="2s" repeatCount="indefinite" />
        </circle>
        <circle cx="-8" cy="-6" r="12" fill="var(--coral)" />
        <circle cx="9" cy="-2" r="12" fill="var(--accent)" />
        <circle cx="0" cy="9" r="12" fill="var(--coral)" opacity="0.85" />
        <text x="-8" y="-3" fontSize="10" fontWeight="800" fill="var(--coral-foreground)" textAnchor="middle">p⁺</text>
        <text x="9" y="2" fontSize="10" fontWeight="800" fill="var(--accent-foreground, #fff)" textAnchor="middle">n⁰</text>
      </g>
      <Label x={320} y={350} text="e⁻ giran alrededor del núcleo" delay={0.4} size={12} />
    </svg>
  );
}

function EcosystemSvg({ compact: _c }: { compact: boolean }) {
  return (
    <svg viewBox={VB} role="img" aria-label="Ecosistema" className={ASPECT}>
      <SceneBG id="eco" from="#ECFDF5" to="#F0FDF4" sparkles={6} sparkleColor="var(--mint-foreground)" />
      <circle cx="560" cy="70" r="30" fill="var(--accent)" />
      <path d="M0 280 C160 260 480 300 640 270 L640 360 L0 360Z" fill="var(--mint)" />
      {[80, 200, 420, 560].map((x, i) => (
        <g key={x}>
          <rect x={x - 6} y={180 + i * 4} width="12" height="80" fill="var(--mint-foreground)" />
          <circle cx={x} cy={170 + i * 4} r="46" fill="var(--mint)" stroke="var(--mint-foreground)" strokeWidth="4">
            <animateTransform attributeName="transform" type="rotate" values={`-3 ${x} ${170 + i * 4};3 ${x} ${170 + i * 4};-3 ${x} ${170 + i * 4}`} dur={`${3 + i * 0.4}s`} repeatCount="indefinite" />
          </circle>
        </g>
      ))}
      {/* fox running */}
      <g>
        <text x="280" y="310" fontSize="36">🦊</text>
        <animateTransform attributeName="transform" type="translate" values="0 0;240 0;0 0" dur="9s" repeatCount="indefinite" />
      </g>
      {/* birds */}
      <g>
        <text x="120" y="120" fontSize="20">🐦</text>
        <text x="160" y="100" fontSize="18">🐦</text>
        <animateTransform attributeName="transform" type="translate" values="0 0;320 30;0 0" dur="7s" repeatCount="indefinite" />
      </g>
      {/* butterfly */}
      <g>
        <text x="380" y="200" fontSize="22">🦋</text>
        <animateMotion dur="6s" repeatCount="indefinite" path="M0 0 q40 -30 80 0 q40 30 80 0 q-40 -30 -80 0 q-40 30 -80 0 z" />
      </g>
    </svg>
  );
}

function FoodChainSvg({ compact: _c }: { compact: boolean }) {
  const items = [{ e: "🌿", x: 60, l: "Plantas" }, { e: "🐛", x: 200, l: "Insectos" }, { e: "🐦", x: 340, l: "Aves" }, { e: "🦊", x: 480, l: "Zorro" }];
  return (
    <svg viewBox={VB} role="img" aria-label="Cadena alimenticia" className={ASPECT}>
      <SceneBG id="fc" from="#FEF3C7" to="#FFFBEB" sparkles={6} sparkleColor="var(--accent)" />
      {items.slice(0, -1).map((it, i) => (
        <g key={i}>
          <path d={`M${it.x + 50} 180 L${items[i + 1].x - 30} 180`} stroke="var(--primary)" strokeWidth="6" strokeLinecap="round" strokeDasharray="12 10">
            <animate attributeName="stroke-dashoffset" values="44;0" dur="1.6s" repeatCount="indefinite" />
          </path>
          <polygon points={`${items[i + 1].x - 30},170 ${items[i + 1].x - 30},190 ${items[i + 1].x - 12},180`} fill="var(--primary)" />
        </g>
      ))}
      {items.map((it, i) => (
        <g key={it.x}>
          <circle cx={it.x + 22} cy="180" r="46" fill="var(--card)" stroke="var(--border)" strokeWidth="4">
            <animate attributeName="r" values="44;50;44" dur="1.8s" begin={`${i * 0.4}s`} repeatCount="indefinite" />
          </circle>
          <text x={it.x + 22} y="198" textAnchor="middle" fontSize="44">{it.e}</text>
          <text x={it.x + 22} y="260" textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--foreground)">{it.l}</text>
        </g>
      ))}
    </svg>
  );
}

function CircuitSvg({ compact: _c }: { compact: boolean }) {
  return (
    <svg viewBox={VB} role="img" aria-label="Circuito eléctrico" className={ASPECT}>
      <SceneBG id="circ" from="#FAFAFA" to="#F4F4F5" sparkles={4} sparkleColor="var(--accent)" />
      {/* wire frame */}
      <rect x="80" y="100" width="480" height="180" rx="20" fill="none" stroke="var(--foreground)" strokeWidth="6" />
      {/* current flow */}
      <rect x="80" y="100" width="480" height="180" rx="20" fill="none" stroke="var(--accent)" strokeWidth="4" strokeDasharray="14 12">
        <animate attributeName="stroke-dashoffset" values="0;-208" dur="1.4s" repeatCount="indefinite" />
      </rect>
      {/* battery */}
      <g transform="translate(110 175)">
        <rect width="80" height="40" fill="var(--card)" stroke="var(--foreground)" strokeWidth="3" rx="4" />
        <line x1="20" y1="6" x2="20" y2="34" stroke="var(--foreground)" strokeWidth="6" />
        <line x1="40" y1="14" x2="40" y2="26" stroke="var(--foreground)" strokeWidth="3" />
        <line x1="55" y1="6" x2="55" y2="34" stroke="var(--foreground)" strokeWidth="6" />
        <text x="-4" y="-6" fontSize="12" fontWeight="800" fill="var(--foreground)">+</text>
        <text x="80" y="-6" fontSize="12" fontWeight="800" fill="var(--foreground)">−</text>
      </g>
      {/* bulb with glow */}
      <g transform="translate(320 100)">
        <circle r="48" cx="0" cy="0" fill="var(--accent)" opacity="0.25">
          <animate attributeName="r" values="42;58;42" dur="1.2s" repeatCount="indefinite" />
        </circle>
        <circle r="32" cx="0" cy="0" fill="var(--accent)" stroke="var(--foreground)" strokeWidth="3">
          <animate attributeName="fill-opacity" values="0.6;1;0.6" dur="1.2s" repeatCount="indefinite" />
        </circle>
        <path d="M-6 18 L-6 28 L6 28 L6 18" fill="var(--foreground)" />
        {/* filament */}
        <path d="M-10 -2 q5 -10 10 0 q5 10 10 0" stroke="var(--coral)" strokeWidth="2" fill="none" />
      </g>
      {/* resistor (zigzag) */}
      <g transform="translate(440 270) rotate(0)">
        <path d="M0 0 l10 -14 l20 28 l20 -28 l20 28 l20 -28 l10 14" stroke="var(--foreground)" strokeWidth="3" fill="none" />
      </g>
      {/* switch */}
      <g transform="translate(540 175)">
        <circle cx="0" cy="20" r="4" fill="var(--foreground)" />
        <circle cx="40" cy="20" r="4" fill="var(--foreground)" />
        <line x1="0" y1="20" x2="36" y2="6" stroke="var(--foreground)" strokeWidth="4" strokeLinecap="round" />
      </g>
      <Label x={150} y={240} text="Batería" delay={0.3} size={11} />
      <Label x={320} y={170} text="Bombilla" delay={0.6} size={11} />
      <Label x={490} y={310} text="Resistencia" delay={0.9} size={11} />
    </svg>
  );
}

function MagnetSvg({ compact: _c }: { compact: boolean }) {
  return (
    <svg viewBox={VB} role="img" aria-label="Imán" className={ASPECT}>
      <SceneBG id="mag" from="#FEF2F2" to="#EFF6FF" sparkles={6} sparkleColor="var(--accent)" />
      <g transform="translate(320 180)">
        <path d="M-90 -80 H-30 V40 A60 60 0 0 0 30 40 V-80 H90 V40 A120 120 0 0 1 -90 40 Z" fill="var(--coral)" stroke="var(--coral-foreground)" strokeWidth="5" />
        <rect x="-90" y="-80" width="60" height="40" fill="var(--coral-foreground)" />
        <text x="-78" y="-50" fill="var(--coral)" fontSize="22" fontWeight="800">N</text>
        <rect x="30" y="-80" width="60" height="40" fill="var(--sky-foreground)" />
        <text x="42" y="-50" fill="var(--sky)" fontSize="22" fontWeight="800">S</text>
      </g>
      {[0, 1, 2, 3].map((i) => (
        <ellipse key={i} cx="320" cy="180" rx={140 + i * 30} ry={70 + i * 16} fill="none" stroke="var(--accent)" strokeWidth="3" opacity={0.6 - i * 0.12}>
          <animate attributeName="rx" values={`${130 + i * 30};${160 + i * 30};${130 + i * 30}`} dur="2.4s" begin={`${i * 0.2}s`} repeatCount="indefinite" />
        </ellipse>
      ))}
      {/* attracted clip */}
      <g>
        <text x="500" y="200" fontSize="24">📎</text>
        <animateTransform attributeName="transform" type="translate" values="0 0;-160 0;-160 0;0 0" dur="3s" repeatCount="indefinite" />
      </g>
      <Label x={320} y={310} text="Campo magnético" delay={0.3} size={12} />
    </svg>
  );
}

function GravitySvg({ compact: _c }: { compact: boolean }) {
  return (
    <svg viewBox={VB} role="img" aria-label="Gravedad" className={ASPECT}>
      <SceneBG id="grav" from="#FEF9C3" to="#ECFCCB" sparkles={4} sparkleColor="var(--accent)" />
      <path d="M0 320 H640 V360 H0Z" fill="var(--mint)" />
      {/* tree */}
      <rect x="100" y="90" width="20" height="220" fill="var(--coral-foreground)" opacity="0.7" />
      <ellipse cx="170" cy="120" rx="80" ry="42" fill="var(--mint)" stroke="var(--mint-foreground)" strokeWidth="3" />
      {/* falling apple */}
      <circle cx="190" cy="130" r="12" fill="var(--coral)" stroke="var(--coral-foreground)" strokeWidth="2">
        <animate attributeName="cy" values="130;310;130" keyTimes="0;0.55;1" dur="2.4s" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.9 1; 0.5 0.5 0.5 1" />
      </circle>
      {/* arrows */}
      <g stroke="var(--accent)" strokeWidth="6" strokeLinecap="round" fill="none">
        {[0, 1, 2].map((i) => (
          <g key={i}>
            <path d={`M${440 + i * 50} 90 V250`} strokeDasharray="14 12">
              <animate attributeName="stroke-dashoffset" values="0;-26" dur="1s" repeatCount="indefinite" />
            </path>
            <polygon points={`${436 + i * 50},250 ${460 + i * 50},250 ${448 + i * 50},278`} fill="var(--accent)" />
          </g>
        ))}
      </g>
      <Label x={490} y={80} text="g = 9.8 m/s²" fill="var(--accent-foreground, var(--foreground))" delay={0.4} size={12} />
    </svg>
  );
}

function DnaSvg({ compact: _c }: { compact: boolean }) {
  const bases = [
    { left: "A", right: "T", c1: "var(--primary)", c2: "var(--accent)" },
    { left: "G", right: "C", c1: "var(--coral)", c2: "var(--mint-foreground)" },
    { left: "T", right: "A", c1: "var(--accent)", c2: "var(--primary)" },
    { left: "C", right: "G", c1: "var(--mint-foreground)", c2: "var(--coral)" },
    { left: "A", right: "T", c1: "var(--primary)", c2: "var(--accent)" },
    { left: "G", right: "C", c1: "var(--coral)", c2: "var(--mint-foreground)" },
    { left: "T", right: "A", c1: "var(--accent)", c2: "var(--primary)" },
    { left: "C", right: "G", c1: "var(--mint-foreground)", c2: "var(--coral)" },
  ];
  return (
    <svg viewBox={VB} role="img" aria-label="ADN" className={ASPECT}>
      <SceneBG id="dna" from="#F5F3FF" to="#FCE7F3" sparkles={8} sparkleColor="var(--primary)" />
      <g transform="translate(320 180)">
        {bases.map((b, i) => {
          const y = -140 + i * 40;
          const off = Math.sin(i * 0.7) * 70;
          return (
            <g key={i}>
              <line x1={off} y1={y} x2={-off} y2={y} stroke="var(--border)" strokeWidth="3" />
              <circle cx={off} cy={y} r="11" fill={b.c1} />
              <circle cx={-off} cy={y} r="11" fill={b.c2} />
              <text x={off} y={y + 4} fontSize="10" fontWeight="800" fill="var(--card)" textAnchor="middle">{b.left}</text>
              <text x={-off} y={y + 4} fontSize="10" fontWeight="800" fill="var(--card)" textAnchor="middle">{b.right}</text>
            </g>
          );
        })}
        <path d="M0 -160 C80 -120 -80 -40 0 0 C80 40 -80 120 0 160" stroke="var(--primary)" strokeWidth="6" fill="none" strokeLinecap="round" />
        <path d="M0 -160 C-80 -120 80 -40 0 0 C-80 40 80 120 0 160" stroke="var(--coral)" strokeWidth="6" fill="none" strokeLinecap="round" />
        <animateTransform attributeName="transform" type="rotate" from="0 0 0" to="360 0 0" dur="14s" repeatCount="indefinite" additive="sum" />
      </g>
      <Label x={530} y={350} text="A-T  ·  G-C" delay={0.3} size={12} />
    </svg>
  );
}

function VolcanoSvg({ compact: _c }: { compact: boolean }) {
  return (
    <svg viewBox={VB} role="img" aria-label="Volcán" className={ASPECT}>
      <SceneBG id="vol" from="#1F2937" to="#7F1D1D" sparkles={20} sparkleColor="#FCA5A5" />
      <path d="M0 320 H640 V360 H0Z" fill="var(--mint-foreground)" opacity="0.6" />
      <path d="M120 320 L300 100 L340 100 L520 320 Z" fill="#374151" stroke="#111827" strokeWidth="3" />
      {/* glowing cracks */}
      <path d="M280 200 L300 240 M340 220 L360 270" stroke="var(--coral)" strokeWidth="3" opacity="0.7">
        <animate attributeName="opacity" values="0.4;1;0.4" dur="1s" repeatCount="indefinite" />
      </path>
      {/* crater */}
      <path d="M280 100 L360 100 L380 130 L260 130 Z" fill="var(--coral)" />
      {/* lava bombs */}
      <g>
        {[0, 1, 2, 3].map((i) => (
          <ellipse key={i} cx={310 + (i - 1.5) * 16} cy="86" rx="14" ry="10" fill="var(--coral)">
            <animate attributeName="cy" values="86;20;86" dur={`${1.4 + i * 0.2}s`} begin={`${i * 0.18}s`} repeatCount="indefinite" />
            <animate attributeName="opacity" values="1;0;1" dur={`${1.4 + i * 0.2}s`} begin={`${i * 0.18}s`} repeatCount="indefinite" />
          </ellipse>
        ))}
      </g>
      {/* smoke */}
      <g>
        {[0, 1, 2].map((i) => (
          <circle key={i} cx={320 + i * 8} cy="50" r="22" fill="#9CA3AF" opacity="0">
            <animate attributeName="cy" values="60;-20" dur={`${3 + i * 0.4}s`} begin={`${i * 0.5}s`} repeatCount="indefinite" />
            <animate attributeName="opacity" values="0;0.7;0" dur={`${3 + i * 0.4}s`} begin={`${i * 0.5}s`} repeatCount="indefinite" />
            <animate attributeName="r" values="18;36" dur={`${3 + i * 0.4}s`} begin={`${i * 0.5}s`} repeatCount="indefinite" />
          </circle>
        ))}
      </g>
      {/* lava streams */}
      <path d="M340 130 C360 220 420 280 500 320" stroke="var(--coral)" strokeWidth="14" fill="none" strokeLinecap="round" />
      <path d="M300 130 C280 220 220 280 140 320" stroke="var(--coral)" strokeWidth="14" fill="none" strokeLinecap="round" />
    </svg>
  );
}

function GeometrySvg({ compact: _c }: { compact: boolean }) {
  return (
    <svg viewBox={VB} role="img" aria-label="Geometría" className={ASPECT}>
      <SceneBG id="geo" from="#EFF6FF" to="#FCE7F3" sparkles={6} sparkleColor="var(--primary)" />
      <g>
        <polygon points="160,260 240,120 320,260" fill="var(--primary)" stroke="var(--foreground)" strokeWidth="3">
          <animateTransform attributeName="transform" type="rotate" from="0 240 200" to="360 240 200" dur="9s" repeatCount="indefinite" />
        </polygon>
        <text x="240" y="300" textAnchor="middle" fontSize="12" fontWeight="700" fill="var(--foreground)">Triángulo</text>
      </g>
      <g>
        <rect x="360" y="140" width="120" height="120" fill="var(--accent)" stroke="var(--foreground)" strokeWidth="3">
          <animateTransform attributeName="transform" type="rotate" from="0 420 200" to="-360 420 200" dur="11s" repeatCount="indefinite" />
        </rect>
        <text x="420" y="300" textAnchor="middle" fontSize="12" fontWeight="700" fill="var(--foreground)">Cuadrado</text>
      </g>
      <g>
        <circle cx="540" cy="200" r="60" fill="var(--mint)" stroke="var(--foreground)" strokeWidth="3">
          <animate attributeName="r" values="50;66;50" dur="2.6s" repeatCount="indefinite" />
        </circle>
        <text x="540" y="300" textAnchor="middle" fontSize="12" fontWeight="700" fill="var(--foreground)">Círculo</text>
      </g>
    </svg>
  );
}

function MultiplicationSvg({ compact: _c }: { compact: boolean }) {
  return (
    <svg viewBox={VB} role="img" aria-label="Multiplicación" className={ASPECT}>
      <SceneBG id="mult" from="#FEF3C7" to="#FFFBEB" sparkles={4} sparkleColor="var(--primary)" />
      <g transform="translate(80 80)">
        {/* row labels */}
        {[0, 1, 2, 3].map((r) => (
          <text key={r} x="-22" y={r * 52 + 8} fontSize="14" fontWeight="800" fill="var(--primary)">{r + 1}</text>
        ))}
        {[0, 1, 2, 3, 4].map((c) => (
          <text key={c} x={c * 52} y="-12" fontSize="14" fontWeight="800" textAnchor="middle" fill="var(--accent)">{c + 1}</text>
        ))}
        {[...Array(4)].map((_, r) => [...Array(5)].map((__, c) => (
          <circle key={`${r}-${c}`} cx={c * 52} cy={r * 52} r="20" fill="var(--primary)">
            <animate attributeName="r" values="14;22;14" dur="1.6s" begin={`${(r * 5 + c) * 0.08}s`} repeatCount="indefinite" />
          </circle>
        )))}
      </g>
      <text x="430" y="180" fontSize="56" fontWeight="800" fill="var(--foreground)">4 × 5</text>
      <text x="430" y="240" fontSize="48" fontWeight="800" fill="var(--accent)">= 20</text>
    </svg>
  );
}

function AlphabetSvg({ compact: _c }: { compact: boolean }) {
  const letters = ["A", "B", "C", "D", "E"];
  const colors = ["var(--primary)", "var(--accent)", "var(--mint-foreground)", "var(--coral)", "var(--sky-foreground)"];
  return (
    <svg viewBox={VB} role="img" aria-label="Alfabeto" className={ASPECT}>
      <SceneBG id="abc" from="#FFF7ED" to="#FEF3C7" sparkles={6} sparkleColor="var(--accent)" />
      {letters.map((l, i) => (
        <g key={l} transform={`translate(${80 + i * 110} 180)`}>
          <rect x="-40" y="-50" width="80" height="100" rx="14" fill={colors[i]} stroke="var(--foreground)" strokeWidth="3">
            <animate attributeName="y" values="-50;-70;-50" dur="1.6s" begin={`${i * 0.18}s`} repeatCount="indefinite" />
          </rect>
          <text x="0" y="14" textAnchor="middle" fontSize="48" fontWeight="900" fill="var(--card)">
            {l}
            <animate attributeName="y" values="14;-6;14" dur="1.6s" begin={`${i * 0.18}s`} repeatCount="indefinite" />
          </text>
        </g>
      ))}
    </svg>
  );
}

function TimelineSvg({ compact: _c }: { compact: boolean }) {
  const events = [{ x: 80, e: "🦕", l: "Era" }, { x: 200, e: "🏛️", l: "Antigua" }, { x: 320, e: "🏰", l: "Medieval" }, { x: 440, e: "⚙️", l: "Industrial" }, { x: 560, e: "🚀", l: "Hoy" }];
  return (
    <svg viewBox={VB} role="img" aria-label="Línea de tiempo" className={ASPECT}>
      <SceneBG id="tl" from="#F5F3FF" to="#EFF6FF" sparkles={4} sparkleColor="var(--primary)" />
      <line x1="40" y1="200" x2="600" y2="200" stroke="var(--border)" strokeWidth="8" />
      <line x1="40" y1="200" x2="600" y2="200" stroke="var(--primary)" strokeWidth="6" strokeDasharray="560 560">
        <animate attributeName="stroke-dashoffset" values="560;0" dur="3s" repeatCount="indefinite" />
      </line>
      {events.map((ev, i) => (
        <g key={ev.x}>
          <circle cx={ev.x} cy="200" r="22" fill={i % 2 ? "var(--accent)" : "var(--mint-foreground)"} stroke="var(--card)" strokeWidth="4">
            <animate attributeName="r" values="18;26;18" dur="2.2s" begin={`${i * 0.4}s`} repeatCount="indefinite" />
          </circle>
          <text x={ev.x} y="208" textAnchor="middle" fontSize="20">{ev.e}</text>
          <text x={ev.x} y={i % 2 ? 270 : 145} textAnchor="middle" fontSize="12" fontWeight="700" fill="var(--foreground)">{ev.l}</text>
        </g>
      ))}
    </svg>
  );
}

function MusicNotesSvg({ compact: _c }: { compact: boolean }) {
  return (
    <svg viewBox={VB} role="img" aria-label="Notas musicales" className={ASPECT}>
      <SceneBG id="music" from="#FDF4FF" to="#EDE9FE" sparkles={6} sparkleColor="var(--primary)" />
      {[120, 160, 200, 240, 280].map((y) => (
        <line key={y} x1="40" y1={y} x2="600" y2={y} stroke="var(--border)" strokeWidth="2" />
      ))}
      {/* clef */}
      <text x="60" y="240" fontSize="80" fill="var(--primary)">𝄞</text>
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <g key={i} transform={`translate(${150 + i * 75} 0)`}>
          <ellipse cx="0" cy={140 + (i % 4) * 30} rx="18" ry="13" fill={i % 2 ? "var(--primary)" : "var(--accent)"} transform="rotate(-20)">
            <animate attributeName="cy" values={`${140 + (i % 4) * 30};${120 + (i % 4) * 30};${140 + (i % 4) * 30}`} dur={`${1 + i * 0.15}s`} repeatCount="indefinite" />
          </ellipse>
          <line x1="16" y1={140 + (i % 4) * 30} x2="16" y2={80 + (i % 4) * 30} stroke={i % 2 ? "var(--primary)" : "var(--accent)"} strokeWidth="3" />
        </g>
      ))}
    </svg>
  );
}

function LifeCycleSvg({ compact: _c }: { compact: boolean }) {
  const stages = [{ e: "🥚", a: 0, l: "Huevo" }, { e: "🐛", a: 90, l: "Oruga" }, { e: "🛡️", a: 180, l: "Crisálida" }, { e: "🦋", a: 270, l: "Mariposa" }];
  return (
    <svg viewBox={VB} role="img" aria-label="Ciclo de vida" className={ASPECT}>
      <SceneBG id="lc" from="#ECFDF5" to="#FDF4FF" sparkles={6} sparkleColor="var(--primary)" />
      <defs>
        <marker id="arrow-lc" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--primary)" />
        </marker>
      </defs>
      <circle cx="320" cy="180" r="120" fill="none" stroke="var(--border)" strokeWidth="4" strokeDasharray="14 10" />
      <circle cx="320" cy="180" r="120" fill="none" stroke="var(--primary)" strokeWidth="4" strokeDasharray="60 700">
        <animateTransform attributeName="transform" type="rotate" from="0 320 180" to="360 320 180" dur="6s" repeatCount="indefinite" />
      </circle>
      {stages.map((s, i) => {
        const rad = ((s.a - 90) * Math.PI) / 180;
        const x = 320 + Math.cos(rad) * 120;
        const y = 180 + Math.sin(rad) * 120;
        return (
          <g key={i}>
            <circle cx={x} cy={y} r="34" fill="var(--card)" stroke="var(--accent)" strokeWidth="4">
              <animate attributeName="r" values="30;38;30" dur="2s" begin={`${i * 0.4}s`} repeatCount="indefinite" />
            </circle>
            <text x={x} y={y + 12} textAnchor="middle" fontSize="32">{s.e}</text>
            <text x={x} y={y + (s.a === 0 ? -50 : s.a === 180 ? 60 : 12) + (s.a === 90 || s.a === 270 ? (s.a === 90 ? 0 : 0) : 0)} textAnchor="middle" fontSize="11" fontWeight="800" fill="var(--foreground)" />
          </g>
        );
      })}
      {/* labels around */}
      <Label x={320} y={42} text="Huevo" delay={0.2} size={12} />
      <Label x={460} y={186} text="Oruga" delay={0.4} size={12} />
      <Label x={320} y={332} text="Crisálida" delay={0.6} size={12} />
      <Label x={170} y={186} text="Mariposa" delay={0.8} size={12} />
    </svg>
  );
}

function WeatherSvg({ compact: _c }: { compact: boolean }) {
  return (
    <svg viewBox={VB} role="img" aria-label="Clima" className={ASPECT}>
      <SceneBG id="wx" from="#E0F2FE" to="#F0F9FF" sparkles={8} sparkleColor="var(--sky-foreground)" />
      <circle cx="120" cy="100" r="36" fill="var(--accent)">
        <animate attributeName="r" values="32;42;32" dur="2.6s" repeatCount="indefinite" />
      </circle>
      <ellipse cx="380" cy="120" rx="100" ry="36" fill="var(--card)" />
      <ellipse cx="430" cy="100" rx="60" ry="28" fill="var(--card)" />
      <ellipse cx="320" cy="110" rx="50" ry="24" fill="var(--card)" />
      <g stroke="var(--sky-foreground)" strokeWidth="6" strokeLinecap="round">
        {[0, 1, 2, 3, 4].map((i) => <line key={i} x1={340 + i * 30} y1="160" x2={324 + i * 30} y2="200" />)}
        <animateTransform attributeName="transform" type="translate" values="0 -10;0 30;0 -10" dur="1s" repeatCount="indefinite" />
      </g>
      {/* lightning */}
      <polygon points="430,150 410,200 430,200 415,250" fill="var(--accent)" opacity="0">
        <animate attributeName="opacity" values="0;0;1;0;0" dur="3s" repeatCount="indefinite" />
      </polygon>
      {/* wind lines */}
      <g stroke="var(--sky-foreground)" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.5">
        {[40, 80, 120].map((y, i) => (
          <path key={y} d={`M0 ${y + 200} q40 -10 80 0 q40 10 80 0`}>
            <animate attributeName="opacity" values="0;0.6;0" dur="3s" begin={`${i * 0.5}s`} repeatCount="indefinite" />
          </path>
        ))}
      </g>
      <path d="M0 300 C160 270 480 320 640 280 L640 360 L0 360Z" fill="var(--mint)" opacity="0.6" />
    </svg>
  );
}

function RocketSvg({ compact: _c }: { compact: boolean }) {
  return (
    <svg viewBox={VB} role="img" aria-label="Cohete" className={ASPECT}>
      <SceneBG id="rkt" from="#0F172A" to="#1E1B4B" sparkles={40} sparkleColor="#FFFFFF" />
      <g>
        <animateTransform attributeName="transform" type="translate" values="280 280;280 60;280 280" dur="4.5s" repeatCount="indefinite" />
        <path d="M40 40 C40 0 80 -10 80 40 L80 160 L40 160 Z" fill="var(--card)" stroke="var(--foreground)" strokeWidth="4" />
        <path d="M80 40 C80 0 40 -10 40 40 L40 160 L80 160 Z" fill="var(--coral)" stroke="var(--foreground)" strokeWidth="4" opacity="0.5" />
        <circle cx="60" cy="70" r="14" fill="var(--sky)" stroke="var(--foreground)" strokeWidth="3" />
        <circle cx="58" cy="68" r="4" fill="#FFFFFF" opacity="0.8" />
        <polygon points="40,140 20,180 40,170" fill="var(--accent)" stroke="var(--foreground)" strokeWidth="2" />
        <polygon points="80,140 100,180 80,170" fill="var(--accent)" stroke="var(--foreground)" strokeWidth="2" />
        {/* flames */}
        <g>
          <path d="M40 170 L60 220 L80 170 Z" fill="var(--coral)">
            <animate attributeName="d" values="M40 170 L60 220 L80 170 Z;M40 170 L60 250 L80 170 Z;M40 170 L60 220 L80 170 Z" dur="0.3s" repeatCount="indefinite" />
          </path>
          <path d="M50 170 L60 200 L70 170 Z" fill="var(--accent)">
            <animate attributeName="d" values="M50 170 L60 200 L70 170 Z;M50 170 L60 220 L70 170 Z;M50 170 L60 200 L70 170 Z" dur="0.2s" repeatCount="indefinite" />
          </path>
        </g>
        {/* smoke particles */}
        {[0, 1, 2, 3].map((i) => (
          <circle key={i} cx={60 + (i - 1.5) * 14} cy="220" r="6" fill="#9CA3AF" opacity="0">
            <animate attributeName="cy" values="220;280" dur="1.2s" begin={`${i * 0.15}s`} repeatCount="indefinite" />
            <animate attributeName="opacity" values="0;0.7;0" dur="1.2s" begin={`${i * 0.15}s`} repeatCount="indefinite" />
            <animate attributeName="r" values="4;14" dur="1.2s" begin={`${i * 0.15}s`} repeatCount="indefinite" />
          </circle>
        ))}
      </g>
      {/* Earth at bottom */}
      <ellipse cx="320" cy="380" rx="320" ry="80" fill="var(--mint)" opacity="0.6" />
    </svg>
  );
}

function WaveSvg({ compact: _c }: { compact: boolean }) {
  return (
    <svg viewBox={VB} role="img" aria-label="Onda" className={ASPECT}>
      <SceneBG id="wave" from="#EFF6FF" to="#FCE7F3" sparkles={4} sparkleColor="var(--primary)" />
      <line x1="0" y1="180" x2="640" y2="180" stroke="var(--border)" strokeWidth="2" strokeDasharray="6 6" />
      {[0, 1, 2].map((i) => (
        <path key={i} d="M0 180 Q80 80 160 180 T320 180 T480 180 T640 180" stroke={i === 0 ? "var(--primary)" : i === 1 ? "var(--accent)" : "var(--mint-foreground)"} strokeWidth="6" fill="none" opacity={0.85 - i * 0.2}>
          <animate attributeName="d" values="M0 180 Q80 80 160 180 T320 180 T480 180 T640 180;M0 180 Q80 280 160 180 T320 180 T480 180 T640 180;M0 180 Q80 80 160 180 T320 180 T480 180 T640 180" dur={`${2 + i * 0.4}s`} repeatCount="indefinite" />
        </path>
      ))}
      {/* amplitude marker */}
      <line x1="80" y1="80" x2="80" y2="180" stroke="var(--accent)" strokeWidth="2" strokeDasharray="3 3" />
      <Label x={100} y={130} text="Amplitud" anchor="start" delay={0.4} size={11} />
      <Label x={320} y={350} text="Frecuencia →" delay={0.7} size={11} />
    </svg>
  );
}

function DigestionSvg({ compact: _c }: { compact: boolean }) {
  return (
    <svg viewBox={VB} role="img" aria-label="Digestión" className={ASPECT}>
      <SceneBG id="dig" from="#FFEDD5" to="#FFF7ED" sparkles={4} sparkleColor="var(--coral)" />
      {/* body silhouette */}
      <ellipse cx="320" cy="180" rx="140" ry="160" fill="var(--card)" stroke="var(--foreground)" strokeWidth="3" opacity="0.3" />
      {/* mouth */}
      <ellipse cx="320" cy="50" rx="22" ry="10" fill="var(--coral)" stroke="var(--foreground)" strokeWidth="2" />
      {/* esophagus */}
      <rect x="310" y="60" width="20" height="80" fill="var(--coral)" opacity="0.6" />
      {/* stomach */}
      <path d="M260 140 C240 180 250 230 320 240 C390 230 400 180 380 140 Z" fill="var(--coral)" stroke="var(--coral-foreground)" strokeWidth="3" />
      {/* intestines */}
      <path d="M280 240 q-30 30 0 60 q40 30 0 60" stroke="var(--coral-foreground)" strokeWidth="14" fill="none" strokeLinecap="round" />
      <path d="M360 240 q30 30 0 60 q-40 30 0 60" stroke="var(--coral-foreground)" strokeWidth="14" fill="none" strokeLinecap="round" />
      {/* food traveling */}
      {[0, 1, 2].map((i) => (
        <circle key={i} r="8" fill="var(--accent)">
          <animateMotion dur="6s" begin={`${i * 1.5}s`} repeatCount="indefinite" path="M320 50 L320 140 C320 200 320 220 320 240 q-30 30 0 60 q40 30 0 60" />
        </circle>
      ))}
      <Label x={500} y={70} text="Boca" delay={0.2} size={11} />
      <Label x={500} y={180} text="Estómago" delay={0.5} size={11} />
      <Label x={500} y={310} text="Intestino" delay={0.8} size={11} />
    </svg>
  );
}

function RespirationSvg({ compact: _c }: { compact: boolean }) {
  return (
    <svg viewBox={VB} role="img" aria-label="Respiración" className={ASPECT}>
      <SceneBG id="resp" from="#E0F2FE" to="#F0F9FF" sparkles={6} sparkleColor="var(--sky-foreground)" />
      {/* trachea */}
      <rect x="310" y="60" width="20" height="100" rx="6" fill="var(--card)" stroke="var(--foreground)" strokeWidth="3" />
      {/* lungs */}
      <g>
        <ellipse cx="240" cy="220" rx="70" ry="90" fill="var(--coral)" stroke="var(--coral-foreground)" strokeWidth="3" opacity="0.85">
          <animate attributeName="rx" values="65;78;65" dur="3s" repeatCount="indefinite" />
        </ellipse>
        <ellipse cx="400" cy="220" rx="70" ry="90" fill="var(--coral)" stroke="var(--coral-foreground)" strokeWidth="3" opacity="0.85">
          <animate attributeName="rx" values="65;78;65" dur="3s" repeatCount="indefinite" />
        </ellipse>
        {/* bronchi */}
        <path d="M320 160 L260 200 M320 160 L380 200" stroke="var(--foreground)" strokeWidth="6" fill="none" strokeLinecap="round" />
      </g>
      {/* O2 in */}
      <g>
        <text x="100" y="80" fontSize="20" fontWeight="800" fill="var(--primary)">O₂</text>
        <animateTransform attributeName="transform" type="translate" values="0 0;220 0;0 0" dur="3s" repeatCount="indefinite" />
      </g>
      {/* CO2 out */}
      <g>
        <text x="500" y="80" fontSize="20" fontWeight="800" fill="var(--sky-foreground)">CO₂</text>
        <animateTransform attributeName="transform" type="translate" values="0 0;-220 0;0 0" dur="3s" begin="1.5s" repeatCount="indefinite" />
      </g>
      <Label x={320} y={350} text="Inhalo O₂ · Exhalo CO₂" delay={0.4} size={12} />
    </svg>
  );
}

function SeasonsSvg({ compact: _c }: { compact: boolean }) {
  const positions = [
    { x: 540, y: 180, e: "🌸", l: "Primavera" },
    { x: 320, y: 320, e: "☀️", l: "Verano" },
    { x: 100, y: 180, e: "🍂", l: "Otoño" },
    { x: 320, y: 40,  e: "❄️", l: "Invierno" },
  ];
  return (
    <svg viewBox={VB} role="img" aria-label="Estaciones" className={ASPECT}>
      <SceneBG id="ssn" from="#FEF3C7" to="#E0F2FE" sparkles={10} sparkleColor="var(--accent)" />
      <circle cx="320" cy="180" r="36" fill="var(--accent)">
        <animate attributeName="r" values="32;42;32" dur="3s" repeatCount="indefinite" />
      </circle>
      <ellipse cx="320" cy="180" rx="220" ry="140" fill="none" stroke="var(--border)" strokeWidth="3" strokeDasharray="6 6" />
      {positions.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r="28" fill="var(--card)" stroke="var(--foreground)" strokeWidth="3" />
          <text x={p.x} y={p.y + 9} textAnchor="middle" fontSize="22">{p.e}</text>
          <text x={p.x} y={p.y + (p.y > 180 ? 56 : -38)} textAnchor="middle" fontSize="12" fontWeight="700" fill="var(--foreground)">{p.l}</text>
        </g>
      ))}
      {/* orbiting Earth */}
      <circle r="14" fill="var(--sky-foreground)">
        <animateMotion dur="10s" repeatCount="indefinite" path="M540 180 A220 140 0 1 1 100 180 A220 140 0 1 1 540 180" />
      </circle>
    </svg>
  );
}

function PhaseChangeSvg({ compact: _c }: { compact: boolean }) {
  return (
    <svg viewBox={VB} role="img" aria-label="Cambios de estado" className={ASPECT}>
      <SceneBG id="ph" from="#EFF6FF" to="#FFE4E6" sparkles={6} sparkleColor="var(--primary)" />
      {/* solid: tight grid */}
      <g transform="translate(80 130)">
        <rect x="-20" y="-20" width="160" height="160" rx="16" fill="var(--sky)" opacity="0.2" stroke="var(--sky-foreground)" strokeWidth="2" />
        {[0, 1, 2, 3].map((r) => [0, 1, 2, 3].map((c) => (
          <circle key={`${r}-${c}`} cx={c * 30 + 10} cy={r * 30 + 10} r="10" fill="var(--sky-foreground)">
            <animate attributeName="cy" values={`${r * 30 + 10};${r * 30 + 12};${r * 30 + 10}`} dur="1.6s" begin={`${(r + c) * 0.1}s`} repeatCount="indefinite" />
          </circle>
        )))}
        <text x="60" y="180" textAnchor="middle" fontSize="13" fontWeight="800" fill="var(--foreground)">Sólido</text>
      </g>
      {/* liquid: looser */}
      <g transform="translate(260 130)">
        <rect x="-20" y="-20" width="160" height="160" rx="16" fill="var(--primary)" opacity="0.18" stroke="var(--primary)" strokeWidth="2" />
        {[...Array(12)].map((_, i) => (
          <circle key={i} cx={(i % 4) * 38 + (i % 2 ? 10 : 0)} cy={Math.floor(i / 4) * 50 + 10} r="9" fill="var(--primary)">
            <animate attributeName="cy" values={`${Math.floor(i / 4) * 50 + 10};${Math.floor(i / 4) * 50 + 30};${Math.floor(i / 4) * 50 + 10}`} dur={`${2 + (i % 3) * 0.3}s`} repeatCount="indefinite" />
          </circle>
        ))}
        <text x="60" y="180" textAnchor="middle" fontSize="13" fontWeight="800" fill="var(--foreground)">Líquido</text>
      </g>
      {/* gas: scattered fast */}
      <g transform="translate(440 130)">
        <rect x="-20" y="-20" width="160" height="160" rx="16" fill="var(--coral)" opacity="0.15" stroke="var(--coral)" strokeWidth="2" />
        {[...Array(10)].map((_, i) => (
          <circle key={i} cx={(i * 53) % 130} cy={(i * 79) % 130} r="8" fill="var(--coral)">
            <animateMotion dur={`${2 + (i % 4) * 0.4}s`} repeatCount="indefinite" path={`M0 0 q${(i % 5) * 10 - 20} ${(i % 3) * 14 - 14} ${(i % 7) * 6 - 12} ${(i % 2) * 20 - 10} q-${(i % 5) * 10} -${(i % 3) * 14} -${(i % 7) * 6} -${(i % 2) * 20}`} />
          </circle>
        ))}
        <text x="60" y="180" textAnchor="middle" fontSize="13" fontWeight="800" fill="var(--foreground)">Gas</text>
      </g>
      {/* arrows */}
      <g stroke="var(--accent)" strokeWidth="3" fill="none" strokeLinecap="round">
        <path d="M230 110 q15 -16 30 0" markerEnd="url(#arr-ph)" />
        <path d="M410 110 q15 -16 30 0" markerEnd="url(#arr-ph)" />
      </g>
      <defs>
        <marker id="arr-ph" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--accent)" />
        </marker>
      </defs>
    </svg>
  );
}

function PendulumSvg({ compact: _c }: { compact: boolean }) {
  return (
    <svg viewBox={VB} role="img" aria-label="Péndulo" className={ASPECT}>
      <SceneBG id="pend" from="#F5F3FF" to="#FFF7ED" sparkles={4} sparkleColor="var(--primary)" />
      {/* support */}
      <rect x="60" y="50" width="520" height="14" rx="6" fill="var(--coral-foreground)" />
      {/* pivot */}
      <circle cx="320" cy="64" r="8" fill="var(--foreground)" />
      {/* arc trail */}
      <path d="M180 280 A180 180 0 0 1 460 280" stroke="var(--border)" strokeWidth="2" strokeDasharray="4 6" fill="none" />
      {/* pendulum */}
      <g>
        <line x1="320" y1="64" x2="320" y2="260" stroke="var(--foreground)" strokeWidth="4" />
        <circle cx="320" cy="270" r="28" fill="var(--accent)" stroke="var(--foreground)" strokeWidth="3" />
        <animateTransform attributeName="transform" type="rotate" values="-40 320 64;40 320 64;-40 320 64" dur="2.4s" repeatCount="indefinite" calcMode="spline" keySplines="0.45 0 0.55 1; 0.45 0 0.55 1" />
      </g>
      <Label x={320} y={340} text="Oscilación constante" delay={0.4} size={12} />
    </svg>
  );
}

function AdditionBlocksSvg({ compact: _c }: { compact: boolean }) {
  return (
    <svg viewBox={VB} role="img" aria-label="Sumas" className={ASPECT}>
      <SceneBG id="add" from="#ECFDF5" to="#FFFBEB" sparkles={4} sparkleColor="var(--accent)" />
      {/* group A */}
      <g transform="translate(60 140)">
        {[0, 1, 2].map((i) => (
          <rect key={i} x={i * 50} y="0" width="44" height="44" rx="8" fill="var(--primary)" stroke="var(--foreground)" strokeWidth="3">
            <animate attributeName="y" values="0;-10;0" dur="1.4s" begin={`${i * 0.1}s`} repeatCount="indefinite" />
          </rect>
        ))}
        <text x="74" y="80" textAnchor="middle" fontSize="32" fontWeight="800" fill="var(--foreground)">3</text>
      </g>
      <text x="240" y="180" fontSize="48" fontWeight="800" fill="var(--foreground)">+</text>
      {/* group B */}
      <g transform="translate(280 140)">
        {[0, 1].map((i) => (
          <rect key={i} x={i * 50} y="0" width="44" height="44" rx="8" fill="var(--accent)" stroke="var(--foreground)" strokeWidth="3">
            <animate attributeName="y" values="0;-10;0" dur="1.4s" begin={`${(i + 0.5) * 0.1}s`} repeatCount="indefinite" />
          </rect>
        ))}
        <text x="50" y="80" textAnchor="middle" fontSize="32" fontWeight="800" fill="var(--foreground)">2</text>
      </g>
      <text x="420" y="180" fontSize="48" fontWeight="800" fill="var(--foreground)">=</text>
      <g transform="translate(460 140)">
        {[0, 1, 2, 3, 4].map((i) => (
          <rect key={i} x={i * 30} y="0" width="26" height="44" rx="6" fill="var(--mint-foreground)" stroke="var(--foreground)" strokeWidth="3" opacity="0">
            <animate attributeName="opacity" values="0;1" dur="0.4s" begin={`${0.6 + i * 0.15}s`} fill="freeze" />
          </rect>
        ))}
        <text x="75" y="80" textAnchor="middle" fontSize="32" fontWeight="800" fill="var(--accent)">5</text>
      </g>
    </svg>
  );
}

function MapRouteSvg({ compact: _c }: { compact: boolean }) {
  return (
    <svg viewBox={VB} role="img" aria-label="Mapa con ruta" className={ASPECT}>
      <SceneBG id="map" from="#ECFDF5" to="#FEF3C7" sparkles={6} sparkleColor="var(--mint-foreground)" />
      {/* land patches */}
      <path d="M40 80 q60 -40 140 -10 q120 60 220 0 q80 -50 200 30 q-20 80 -120 100 q-100 30 -220 -10 q-120 -40 -220 -110 z" fill="var(--mint)" opacity="0.7" stroke="var(--mint-foreground)" strokeWidth="3" />
      <path d="M120 230 q80 30 200 10 q120 -20 240 30 q-100 70 -240 60 q-160 -10 -200 -100 z" fill="var(--accent)" opacity="0.4" stroke="var(--mint-foreground)" strokeWidth="2" />
      {/* route */}
      <path d="M100 150 C200 200 320 100 440 200 S560 280 580 240" stroke="var(--coral)" strokeWidth="6" fill="none" strokeLinecap="round" strokeDasharray="14 10">
        <animate attributeName="stroke-dashoffset" values="0;-48" dur="1.6s" repeatCount="indefinite" />
      </path>
      {/* pins */}
      <g>
        <circle cx="100" cy="150" r="14" fill="var(--coral)" stroke="var(--card)" strokeWidth="4" />
        <text x="100" y="155" textAnchor="middle" fontSize="14">📍</text>
      </g>
      <g>
        <circle cx="580" cy="240" r="14" fill="var(--primary)" stroke="var(--card)" strokeWidth="4" />
        <text x="580" y="245" textAnchor="middle" fontSize="14">🏁</text>
      </g>
      {/* moving marker */}
      <circle r="10" fill="var(--accent)" stroke="var(--card)" strokeWidth="3">
        <animateMotion dur="4s" repeatCount="indefinite" path="M100 150 C200 200 320 100 440 200 S560 280 580 240" />
      </circle>
      <Label x={320} y={340} text="Trazando la ruta" delay={0.4} size={12} />
    </svg>
  );
}

function GenericSvg({ compact: _c }: { compact: boolean }) {
  return (
    <svg viewBox={VB} role="img" aria-label="Animación" className={ASPECT}>
      <SceneBG id="gen" from="#F5F3FF" to="#FCE7F3" sparkles={10} sparkleColor="var(--primary)" />
      {[0, 1, 2, 3].map((i) => (
        <circle key={i} cx={170 + i * 90} cy={180} r={34 + i * 4} fill={i % 2 ? "var(--accent)" : "var(--primary)"} opacity="0.78" stroke="var(--card)" strokeWidth="3">
          <animate attributeName="cy" values={`${180};${130 + i * 14};${180}`} dur={`${2.4 + i * 0.25}s`} repeatCount="indefinite" />
        </circle>
      ))}
      <path d="M150 238 C236 282 372 82 496 130" stroke="var(--mint-foreground)" strokeWidth="10" strokeLinecap="round" fill="none" strokeDasharray="20 16">
        <animate attributeName="stroke-dashoffset" values="100;0" dur="2s" repeatCount="indefinite" />
      </path>
    </svg>
  );
}
