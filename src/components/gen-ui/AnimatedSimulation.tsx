import type { SimulationKind } from "@/lib/gen-blocks";

interface AnimatedSimulationProps {
  kind?: SimulationKind;
  title?: string;
  caption?: string;
  steps?: string[];
  compact?: boolean;
  /** Free-text hint (topic, prompt, body) used to refine inference. */
  hint?: string;
}

export function AnimatedSimulation({ kind = "generic", title, caption, steps, compact = false, hint }: AnimatedSimulationProps) {
  const safeKind = kind === "generic" ? inferSimulationKind(`${title ?? ""} ${caption ?? ""} ${hint ?? ""} ${(steps ?? []).join(" ")}`) : kind;
  return (
    <div className="rounded-3xl overflow-hidden bg-card border border-border shadow-soft">
      {(title || caption) && (
        <div className="bg-muted/50 px-4 py-3 border-b border-border">
          {title && <h3 className="font-display text-lg font-bold leading-tight">{title}</h3>}
          {caption && <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed">{caption}</p>}
        </div>
      )}
      <div className={compact ? "p-3" : "p-4"}>
        <div className="rounded-2xl bg-secondary/70 overflow-hidden">
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
    default:                return <GenericSvg compact={compact} />;
  }
}

const KIND_KEYWORDS: { kind: SimulationKind; words: string[] }[] = [
  { kind: "photosynthesis", words: ["fotos", "photosynth", "clorof", "chloroph", "hojas", "leaf"] },
  { kind: "waterCycle",     words: ["ciclo del agua", "water cycle", "evapor", "lluvia", "rain", "precip", "condensa"] },
  { kind: "weather",        words: ["clima", "tiempo atmosf", "weather", "tormenta", "storm", "nube", "cloud"] },
  { kind: "fractionBar",    words: ["fracci", "fraction", "mitad", "tercio", "cuarto", "porcent", "percent"] },
  { kind: "multiplication", words: ["multiplica", "multiply", "tabla", "times table", "producto", "divisi", "divid"] },
  { kind: "geometry",       words: ["geometr", "triáng", "triangle", "círcul", "circle", "cuadrad", "square", "área", "perímetr"] },
  { kind: "logicPath",      words: ["lógica", "logica", "logic", "ruta", "path", "algoritm", "if then", "secuencia"] },
  { kind: "solarSystem",    words: ["solar", "planeta", "planet", "sol ", "sun ", "luna", "moon", "órbita", "orbit", "espacio", "space"] },
  { kind: "rocket",         words: ["cohete", "rocket", "nave", "spaceship", "lanzamient", "launch"] },
  { kind: "heart",          words: ["coraz", "heart", "sangre", "blood", "circul", "vena", "vein", "arteri", "pulso", "pulse"] },
  { kind: "atom",           words: ["átom", "atom", "molec", "neutron", "electron", "protón", "químic", "chemistry"] },
  { kind: "dna",            words: ["adn", "dna", "gen ", "genét", "genetic", "cromos", "chromos"] },
  { kind: "ecosystem",      words: ["ecosistem", "ecosystem", "selva", "bosque", "forest", "habitat", "biodivers"] },
  { kind: "foodChain",      words: ["cadena alim", "food chain", "depredador", "predator", "presa", "prey", "carnívor", "herbívor"] },
  { kind: "lifeCycle",      words: ["ciclo de vida", "life cycle", "metamorf", "mariposa", "butterfly", "rana", "frog", "huevo", "larva"] },
  { kind: "circuit",        words: ["circuit", "electric", "voltaj", "voltage", "corriente", "current", "bombilla", "bulb", "bater"] },
  { kind: "magnet",         words: ["imán", "iman", "magnet", "polo norte", "polo sur", "campo magnét"] },
  { kind: "gravity",        words: ["graved", "gravity", "caída", "newton", "manzana cae", "fuerza"] },
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

/** Small inline SVG accent for quizzes/tryIt — picks a thematic motif based on the question. */
export function QuizMotif({ text, className = "" }: { text: string; className?: string }) {
  const kind = inferSimulationKind(text);
  return (
    <div className={`rounded-2xl overflow-hidden bg-secondary/60 ${className}`}>
      <SimSvg kind={kind} compact />
    </div>
  );
}

/* ============== individual scenes ============== */

const VB = "0 0 640 360";
const ASPECT = "w-full aspect-[16/9]";

function PhotosynthesisSvg({ compact: _c }: { compact: boolean }) {
  return (
    <svg viewBox={VB} role="img" aria-label="Fotosíntesis" className={ASPECT}>
      <rect width="640" height="360" fill="var(--secondary)" />
      <circle cx="88" cy="78" r="38" fill="var(--accent)"><animate attributeName="r" values="34;42;34" dur="2.8s" repeatCount="indefinite" /></circle>
      <g stroke="var(--accent)" strokeWidth="10" strokeLinecap="round" opacity="0.75">
        <line x1="88" y1="18" x2="88" y2="2" /><line x1="88" y1="154" x2="88" y2="138" />
        <line x1="28" y1="78" x2="12" y2="78" /><line x1="164" y1="78" x2="148" y2="78" />
        <animateTransform attributeName="transform" type="rotate" from="0 88 78" to="360 88 78" dur="12s" repeatCount="indefinite" />
      </g>
      <g stroke="var(--accent)" strokeWidth="8" strokeLinecap="round" fill="none">
        {[0,1,2].map((i) => (
          <path key={i} d={`M${132 + i*28} ${106 + i*12} C220 ${130 + i*10}, 276 ${160 + i*8}, 322 205`} opacity="0.7">
            <animate attributeName="stroke-dasharray" values="1 240;90 240;1 240" dur="2.6s" begin={`${i*0.35}s`} repeatCount="indefinite" />
            <animate attributeName="stroke-dashoffset" values="240;0" dur="2.6s" begin={`${i*0.35}s`} repeatCount="indefinite" />
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
        {[0,1,2].map((i) => <text key={i} x={470 + i*34} y={90 + i*44} fontSize="24" fontWeight="700">CO₂</text>)}
        <animateTransform attributeName="transform" type="translate" values="40 0;0 35;40 0" dur="4s" repeatCount="indefinite" />
      </g>
      <g fill="var(--primary)" fontSize="28" fontWeight="800">
        <text x="455" y="250">O₂</text><text x="500" y="285">O₂</text>
        <animateTransform attributeName="transform" type="translate" values="0 20;34 -42;0 20" dur="3.5s" repeatCount="indefinite" />
      </g>
    </svg>
  );
}

function WaterCycleSvg({ compact: _c }: { compact: boolean }) {
  return (
    <svg viewBox={VB} role="img" aria-label="Ciclo del agua" className={ASPECT}>
      <rect width="640" height="360" fill="var(--secondary)" />
      <path d="M0 292 C120 252 206 322 326 286 C450 248 520 302 640 270 L640 360 L0 360Z" fill="var(--sky)" opacity="0.75" />
      <path d="M152 244 C190 160 232 106 318 118 C404 130 446 182 492 238" fill="var(--mint)" opacity="0.65" />
      <ellipse cx="365" cy="88" rx="115" ry="42" fill="var(--card)" opacity="0.95"><animate attributeName="cx" values="345;382;345" dur="5s" repeatCount="indefinite" /></ellipse>
      <g stroke="var(--sky-foreground)" strokeWidth="7" strokeLinecap="round">
        {[0,1,2,3].map((i) => <line key={i} x1={310 + i*36} y1="130" x2={292 + i*36} y2="176" opacity="0.65" />)}
        <animateTransform attributeName="transform" type="translate" values="0 -8;0 18;0 -8" dur="1.2s" repeatCount="indefinite" />
      </g>
      <path d="M168 272 C142 205 155 160 200 122" stroke="var(--accent)" strokeWidth="9" fill="none" strokeLinecap="round" strokeDasharray="18 18"><animate attributeName="stroke-dashoffset" values="80;0" dur="1.8s" repeatCount="indefinite" /></path>
      <path d="M464 236 C520 196 518 142 454 104" stroke="var(--primary)" strokeWidth="9" fill="none" strokeLinecap="round" strokeDasharray="18 18"><animate attributeName="stroke-dashoffset" values="0;80" dur="2.2s" repeatCount="indefinite" /></path>
    </svg>
  );
}

function FractionBarSvg({ compact: _c }: { compact: boolean }) {
  return (
    <svg viewBox={VB} role="img" aria-label="Fracciones" className={ASPECT}>
      <rect width="640" height="360" fill="var(--secondary)" />
      {[0,1,2,3,4].map((i) => (
        <rect key={i} x={100 + i*88} y="130" width="80" height="96" rx="16" fill={i < 3 ? "var(--primary)" : "var(--card)"} stroke="var(--border)" strokeWidth="4">
          {i < 3 && <animate attributeName="y" values="130;112;130" dur="2s" begin={`${i*0.18}s`} repeatCount="indefinite" />}
        </rect>
      ))}
      <text x="260" y="286" fill="var(--foreground)" fontSize="44" fontWeight="800">3/5</text>
    </svg>
  );
}

function LogicPathSvg({ compact: _c }: { compact: boolean }) {
  return (
    <svg viewBox={VB} role="img" aria-label="Ruta lógica" className={ASPECT}>
      <rect width="640" height="360" fill="var(--secondary)" />
      <path d="M96 180 H238 C278 180 278 98 330 98 C382 98 390 180 444 180 H544" stroke="var(--border)" strokeWidth="20" strokeLinecap="round" fill="none" />
      <path d="M96 180 H238 C278 180 278 98 330 98 C382 98 390 180 444 180 H544" stroke="var(--primary)" strokeWidth="10" strokeLinecap="round" fill="none" strokeDasharray="36 28"><animate attributeName="stroke-dashoffset" values="260;0" dur="2.6s" repeatCount="indefinite" /></path>
      {[96,330,544].map((x,i) => <circle key={x} cx={x} cy={i===1?98:180} r="28" fill={i===1?"var(--accent)":"var(--mint)"} stroke="var(--card)" strokeWidth="8" />)}
      <circle cx="96" cy="180" r="10" fill="var(--primary-foreground)"><animateMotion dur="3.2s" repeatCount="indefinite" path="M0 0 H142 C182 0 182 -82 234 -82 C286 -82 294 0 348 0 H448" /></circle>
    </svg>
  );
}

function SolarSystemSvg({ compact: _c }: { compact: boolean }) {
  const orbits = [{r: 70, c:"var(--primary)", d:6}, {r:115, c:"var(--accent)", d:9}, {r:160, c:"var(--mint-foreground)", d:13}];
  return (
    <svg viewBox={VB} role="img" aria-label="Sistema solar" className={ASPECT}>
      <rect width="640" height="360" fill="var(--secondary)" />
      {[...Array(40)].map((_,i) => <circle key={i} cx={(i*53)%640} cy={(i*97)%360} r="1.5" fill="var(--foreground)" opacity="0.3"><animate attributeName="opacity" values="0.1;0.6;0.1" dur={`${2+(i%4)}s`} begin={`${i*0.1}s`} repeatCount="indefinite" /></circle>)}
      <circle cx="320" cy="180" r="32" fill="var(--accent)"><animate attributeName="r" values="30;36;30" dur="3s" repeatCount="indefinite" /></circle>
      {orbits.map((o,i) => (
        <g key={i}>
          <circle cx="320" cy="180" r={o.r} fill="none" stroke="var(--border)" strokeWidth="1.5" strokeDasharray="3 5" />
          <circle r={i===2?14:i===1?11:8} fill={o.c}>
            <animateMotion dur={`${o.d}s`} repeatCount="indefinite" path={`M${o.r} 0 A${o.r} ${o.r} 0 1 1 ${-o.r} 0 A${o.r} ${o.r} 0 1 1 ${o.r} 0`} />
            <animateTransform attributeName="transform" type="translate" values="320 180;320 180" />
          </circle>
        </g>
      ))}
    </svg>
  );
}

function HeartSvg({ compact: _c }: { compact: boolean }) {
  return (
    <svg viewBox={VB} role="img" aria-label="Corazón latiendo" className={ASPECT}>
      <rect width="640" height="360" fill="var(--secondary)" />
      <g transform="translate(220 80)">
        <path d="M100 180 C30 130 30 60 90 50 C120 45 140 70 150 90 C160 70 180 45 210 50 C270 60 270 130 200 180 L150 220 Z" fill="var(--coral)" stroke="var(--coral-foreground)" strokeWidth="6">
          <animateTransform attributeName="transform" type="scale" values="1;1.08;1;1.08;1" dur="1.4s" repeatCount="indefinite" additive="sum" />
        </path>
      </g>
      <path d="M40 300 L140 300 L170 240 L200 340 L230 280 L260 300 L600 300" stroke="var(--primary)" strokeWidth="5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M40 300 L140 300 L170 240 L200 340 L230 280 L260 300 L600 300" stroke="var(--accent)" strokeWidth="5" fill="none" strokeLinecap="round" strokeDasharray="8 800"><animate attributeName="stroke-dashoffset" values="0;-808" dur="2.4s" repeatCount="indefinite" /></path>
    </svg>
  );
}

function AtomSvg({ compact: _c }: { compact: boolean }) {
  return (
    <svg viewBox={VB} role="img" aria-label="Átomo" className={ASPECT}>
      <rect width="640" height="360" fill="var(--secondary)" />
      <g transform="translate(320 180)">
        {[0,60,120].map((deg, i) => (
          <g key={i} transform={`rotate(${deg})`}>
            <ellipse cx="0" cy="0" rx="150" ry="55" fill="none" stroke="var(--border)" strokeWidth="3" />
            <circle r="10" fill={i===0?"var(--primary)":i===1?"var(--accent)":"var(--mint-foreground)"}>
              <animateMotion dur={`${2.5 + i*0.4}s`} repeatCount="indefinite" path="M150 0 A150 55 0 1 1 -150 0 A150 55 0 1 1 150 0" />
            </circle>
          </g>
        ))}
        <circle r="22" fill="var(--accent)" /><circle r="22" cx="-12" cy="-8" fill="var(--coral)" opacity="0.85" />
      </g>
    </svg>
  );
}

function EcosystemSvg({ compact: _c }: { compact: boolean }) {
  return (
    <svg viewBox={VB} role="img" aria-label="Ecosistema" className={ASPECT}>
      <rect width="640" height="360" fill="var(--secondary)" />
      <path d="M0 280 C160 260 480 300 640 270 L640 360 L0 360Z" fill="var(--mint)" />
      {[80,200,420,560].map((x,i) => (
        <g key={x}>
          <rect x={x-6} y={180+i*4} width="12" height="80" fill="var(--mint-foreground)" />
          <circle cx={x} cy={170+i*4} r="46" fill="var(--mint)" stroke="var(--mint-foreground)" strokeWidth="4">
            <animateTransform attributeName="transform" type="rotate" values={`-3 ${x} ${170+i*4};3 ${x} ${170+i*4};-3 ${x} ${170+i*4}`} dur={`${3+i*0.4}s`} repeatCount="indefinite" />
          </circle>
        </g>
      ))}
      <circle cx="560" cy="70" r="34" fill="var(--accent)" />
      <g><circle cx="300" cy="300" r="14" fill="var(--coral)" /><circle cx="320" cy="295" r="10" fill="var(--coral)" /><animateTransform attributeName="transform" type="translate" values="0 0;200 0;0 0" dur="9s" repeatCount="indefinite" /></g>
      <g fill="var(--sky-foreground)"><circle cx="120" cy="120" r="6" /><circle cx="160" cy="100" r="6" /><animateTransform attributeName="transform" type="translate" values="0 0;320 30;0 0" dur="7s" repeatCount="indefinite" /></g>
    </svg>
  );
}

function FoodChainSvg({ compact: _c }: { compact: boolean }) {
  const items = [{e:"🌿", x:60}, {e:"🐛", x:200}, {e:"🐦", x:340}, {e:"🦊", x:480}];
  return (
    <svg viewBox={VB} role="img" aria-label="Cadena alimenticia" className={ASPECT}>
      <rect width="640" height="360" fill="var(--secondary)" />
      {items.slice(0,-1).map((it,i) => (
        <g key={i}>
          <path d={`M${it.x+50} 180 L${items[i+1].x-30} 180`} stroke="var(--primary)" strokeWidth="6" strokeLinecap="round" strokeDasharray="12 10"><animate attributeName="stroke-dashoffset" values="44;0" dur="1.6s" repeatCount="indefinite" /></path>
          <polygon points={`${items[i+1].x-30},170 ${items[i+1].x-30},190 ${items[i+1].x-12},180`} fill="var(--primary)" />
        </g>
      ))}
      {items.map((it) => (
        <g key={it.x}>
          <circle cx={it.x+22} cy="180" r="46" fill="var(--card)" stroke="var(--border)" strokeWidth="4" />
          <text x={it.x+22} y="198" textAnchor="middle" fontSize="44">{it.e}</text>
        </g>
      ))}
    </svg>
  );
}

function CircuitSvg({ compact: _c }: { compact: boolean }) {
  return (
    <svg viewBox={VB} role="img" aria-label="Circuito eléctrico" className={ASPECT}>
      <rect width="640" height="360" fill="var(--secondary)" />
      <rect x="80" y="80" width="480" height="200" rx="20" fill="none" stroke="var(--foreground)" strokeWidth="6" />
      <rect x="80" y="80" width="480" height="200" rx="20" fill="none" stroke="var(--accent)" strokeWidth="4" strokeDasharray="14 12"><animate attributeName="stroke-dashoffset" values="0;-208" dur="1.6s" repeatCount="indefinite" /></rect>
      <rect x="100" y="170" width="60" height="24" fill="var(--primary)" /><rect x="160" y="160" width="14" height="44" fill="var(--primary)" />
      <text x="105" y="158" fontSize="14" fontWeight="700" fill="var(--foreground)">+ −</text>
      <circle cx="320" cy="80" r="36" fill="var(--accent)"><animate attributeName="fill-opacity" values="0.5;1;0.5" dur="1.2s" repeatCount="indefinite" /></circle>
      <line x1="305" y1="80" x2="335" y2="80" stroke="var(--accent-foreground)" strokeWidth="4" />
      <g transform="translate(490 270) rotate(-30)"><rect width="40" height="14" rx="3" fill="var(--foreground)" /></g>
    </svg>
  );
}

function MagnetSvg({ compact: _c }: { compact: boolean }) {
  return (
    <svg viewBox={VB} role="img" aria-label="Imán" className={ASPECT}>
      <rect width="640" height="360" fill="var(--secondary)" />
      <g transform="translate(320 180)">
        <path d="M-90 -80 H-30 V40 A60 60 0 0 0 30 40 V-80 H90 V40 A120 120 0 0 1 -90 40 Z" fill="var(--coral)" stroke="var(--coral-foreground)" strokeWidth="5" />
        <rect x="-90" y="-80" width="60" height="40" fill="var(--coral-foreground)" /><text x="-78" y="-50" fill="var(--coral)" fontSize="22" fontWeight="800">N</text>
        <rect x="30" y="-80" width="60" height="40" fill="var(--sky-foreground)" /><text x="42" y="-50" fill="var(--sky)" fontSize="22" fontWeight="800">S</text>
      </g>
      {[0,1,2,3].map((i) => (
        <ellipse key={i} cx="320" cy="180" rx={140 + i*30} ry={70 + i*16} fill="none" stroke="var(--accent)" strokeWidth="3" opacity={0.6 - i*0.12}>
          <animate attributeName="rx" values={`${130+i*30};${160+i*30};${130+i*30}`} dur="2.4s" begin={`${i*0.2}s`} repeatCount="indefinite" />
        </ellipse>
      ))}
    </svg>
  );
}

function GravitySvg({ compact: _c }: { compact: boolean }) {
  return (
    <svg viewBox={VB} role="img" aria-label="Gravedad" className={ASPECT}>
      <rect width="640" height="360" fill="var(--secondary)" />
      <path d="M0 320 H640 V360 H0Z" fill="var(--mint)" />
      <rect x="100" y="90" width="20" height="220" fill="var(--mint-foreground)" />
      <ellipse cx="170" cy="120" rx="80" ry="42" fill="var(--mint)" />
      <circle cx="190" cy="130" r="14" fill="var(--coral)">
        <animate attributeName="cy" values="130;310;130" keyTimes="0;0.55;1" dur="2.2s" repeatCount="indefinite" />
        <animate attributeName="r" values="14;14;18;14" keyTimes="0;0.5;0.6;1" dur="2.2s" repeatCount="indefinite" />
      </circle>
      <g stroke="var(--accent)" strokeWidth="6" strokeLinecap="round" fill="none">
        {[0,1,2].map((i) => (<path key={i} d={`M${440+i*50} 90 V250`} strokeDasharray="14 12"><animate attributeName="stroke-dashoffset" values="0;-26" dur="1s" repeatCount="indefinite" /></path>))}
        <polygon points="436,250 460,250 448,278" fill="var(--accent)" />
        <polygon points="486,250 510,250 498,278" fill="var(--accent)" />
        <polygon points="536,250 560,250 548,278" fill="var(--accent)" />
      </g>
    </svg>
  );
}

function DnaSvg({ compact: _c }: { compact: boolean }) {
  return (
    <svg viewBox={VB} role="img" aria-label="ADN" className={ASPECT}>
      <rect width="640" height="360" fill="var(--secondary)" />
      <g transform="translate(320 180)">
        {[...Array(8)].map((_,i) => {
          const y = -140 + i*40;
          return <line key={i} x1={Math.sin(i*0.7)*70} y1={y} x2={-Math.sin(i*0.7)*70} y2={y} stroke={i%2?"var(--accent)":"var(--mint-foreground)"} strokeWidth="6" strokeLinecap="round" />;
        })}
        <path d="M0 -160 C80 -120 -80 -40 0 0 C80 40 -80 120 0 160" stroke="var(--primary)" strokeWidth="8" fill="none" strokeLinecap="round" />
        <path d="M0 -160 C-80 -120 80 -40 0 0 C-80 40 80 120 0 160" stroke="var(--coral)" strokeWidth="8" fill="none" strokeLinecap="round" />
        <animateTransform attributeName="transform" type="rotate" from="0 0 0" to="360 0 0" dur="14s" repeatCount="indefinite" additive="sum" />
      </g>
    </svg>
  );
}

function VolcanoSvg({ compact: _c }: { compact: boolean }) {
  return (
    <svg viewBox={VB} role="img" aria-label="Volcán" className={ASPECT}>
      <rect width="640" height="360" fill="var(--secondary)" />
      <path d="M0 320 H640 V360 H0Z" fill="var(--mint)" />
      <path d="M120 320 L300 100 L340 100 L520 320 Z" fill="var(--foreground)" opacity="0.85" />
      <path d="M280 100 L360 100 L380 130 L260 130 Z" fill="var(--coral)" />
      <g>
        {[0,1,2].map((i) => (
          <ellipse key={i} cx={310 + (i-1)*20} cy="86" rx="20" ry="14" fill="var(--coral)">
            <animate attributeName="cy" values="86;30;86" dur={`${1.6+i*0.2}s`} begin={`${i*0.2}s`} repeatCount="indefinite" />
            <animate attributeName="opacity" values="1;0;1" dur={`${1.6+i*0.2}s`} begin={`${i*0.2}s`} repeatCount="indefinite" />
          </ellipse>
        ))}
      </g>
      <path d="M340 130 C360 220 420 280 500 320" stroke="var(--coral)" strokeWidth="14" fill="none" strokeLinecap="round" />
      <path d="M300 130 C280 220 220 280 140 320" stroke="var(--coral)" strokeWidth="14" fill="none" strokeLinecap="round" />
    </svg>
  );
}

function GeometrySvg({ compact: _c }: { compact: boolean }) {
  return (
    <svg viewBox={VB} role="img" aria-label="Geometría" className={ASPECT}>
      <rect width="640" height="360" fill="var(--secondary)" />
      <polygon points="160,260 240,120 320,260" fill="var(--primary)" stroke="var(--foreground)" strokeWidth="4">
        <animateTransform attributeName="transform" type="rotate" from="0 240 200" to="360 240 200" dur="9s" repeatCount="indefinite" />
      </polygon>
      <rect x="360" y="140" width="120" height="120" fill="var(--accent)" stroke="var(--foreground)" strokeWidth="4">
        <animateTransform attributeName="transform" type="rotate" from="0 420 200" to="-360 420 200" dur="11s" repeatCount="indefinite" />
      </rect>
      <circle cx="540" cy="200" r="60" fill="var(--mint)" stroke="var(--foreground)" strokeWidth="4">
        <animate attributeName="r" values="50;66;50" dur="2.6s" repeatCount="indefinite" />
      </circle>
    </svg>
  );
}

function MultiplicationSvg({ compact: _c }: { compact: boolean }) {
  return (
    <svg viewBox={VB} role="img" aria-label="Multiplicación" className={ASPECT}>
      <rect width="640" height="360" fill="var(--secondary)" />
      <g transform="translate(80 80)">
        {[...Array(4)].map((_,r) => [...Array(5)].map((__,c) => (
          <circle key={`${r}-${c}`} cx={c*52} cy={r*52} r="20" fill="var(--primary)">
            <animate attributeName="r" values="14;22;14" dur="1.6s" begin={`${(r*5+c)*0.08}s`} repeatCount="indefinite" />
          </circle>
        )))}
      </g>
      <text x="430" y="200" fontSize="56" fontWeight="800" fill="var(--foreground)">4×5</text>
      <text x="430" y="260" fontSize="44" fontWeight="800" fill="var(--accent)">= 20</text>
    </svg>
  );
}

function AlphabetSvg({ compact: _c }: { compact: boolean }) {
  const letters = ["A","B","C","D","E"];
  return (
    <svg viewBox={VB} role="img" aria-label="Alfabeto" className={ASPECT}>
      <rect width="640" height="360" fill="var(--secondary)" />
      {letters.map((l,i) => (
        <g key={l} transform={`translate(${80 + i*110} 180)`}>
          <rect x="-40" y="-50" width="80" height="100" rx="14" fill={i%2?"var(--accent)":"var(--primary)"} stroke="var(--foreground)" strokeWidth="4">
            <animate attributeName="y" values="-50;-70;-50" dur="1.6s" begin={`${i*0.18}s`} repeatCount="indefinite" />
          </rect>
          <text x="0" y="14" textAnchor="middle" fontSize="48" fontWeight="900" fill="var(--card)">{l}<animate attributeName="y" values="14;-6;14" dur="1.6s" begin={`${i*0.18}s`} repeatCount="indefinite" /></text>
        </g>
      ))}
    </svg>
  );
}

function TimelineSvg({ compact: _c }: { compact: boolean }) {
  const dots = [80, 200, 320, 440, 560];
  return (
    <svg viewBox={VB} role="img" aria-label="Línea de tiempo" className={ASPECT}>
      <rect width="640" height="360" fill="var(--secondary)" />
      <line x1="40" y1="180" x2="600" y2="180" stroke="var(--border)" strokeWidth="8" />
      <line x1="40" y1="180" x2="600" y2="180" stroke="var(--primary)" strokeWidth="6" strokeDasharray="560 560"><animate attributeName="stroke-dashoffset" values="560;0" dur="3s" repeatCount="indefinite" /></line>
      {dots.map((x,i) => (
        <g key={x}>
          <circle cx={x} cy="180" r="18" fill={i%2?"var(--accent)":"var(--mint-foreground)"} stroke="var(--card)" strokeWidth="4">
            <animate attributeName="r" values="14;22;14" dur="2s" begin={`${i*0.4}s`} repeatCount="indefinite" />
          </circle>
          <line x1={x} y1={i%2?180:180} x2={x} y2={i%2?120:240} stroke="var(--foreground)" strokeWidth="3" />
          <rect x={x-30} y={i%2?80:250} width="60" height="40" rx="8" fill="var(--card)" stroke="var(--border)" strokeWidth="2" />
        </g>
      ))}
    </svg>
  );
}

function MusicNotesSvg({ compact: _c }: { compact: boolean }) {
  return (
    <svg viewBox={VB} role="img" aria-label="Notas musicales" className={ASPECT}>
      <rect width="640" height="360" fill="var(--secondary)" />
      {[100,140,180,220,260].map((y) => <line key={y} x1="40" y1={y} x2="600" y2={y} stroke="var(--border)" strokeWidth="2" />)}
      {[0,1,2,3,4].map((i) => (
        <g key={i} transform={`translate(${100 + i*100} 0)`}>
          <ellipse cx="0" cy={120 + (i%3)*40} rx="20" ry="14" fill={i%2?"var(--primary)":"var(--accent)"} transform="rotate(-20)">
            <animate attributeName="cy" values={`${120 + (i%3)*40};${100 + (i%3)*40};${120 + (i%3)*40}`} dur={`${1+i*0.15}s`} repeatCount="indefinite" />
          </ellipse>
          <line x1="18" y1={120 + (i%3)*40} x2="18" y2={60 + (i%3)*40} stroke={i%2?"var(--primary)":"var(--accent)"} strokeWidth="4" />
        </g>
      ))}
    </svg>
  );
}

function LifeCycleSvg({ compact: _c }: { compact: boolean }) {
  const stages = [{e:"🥚", a:0},{e:"🐛", a:90},{e:"🛡️", a:180},{e:"🦋", a:270}];
  return (
    <svg viewBox={VB} role="img" aria-label="Ciclo de vida" className={ASPECT}>
      <rect width="640" height="360" fill="var(--secondary)" />
      <circle cx="320" cy="180" r="120" fill="none" stroke="var(--border)" strokeWidth="4" strokeDasharray="14 10" />
      <circle cx="320" cy="180" r="120" fill="none" stroke="var(--primary)" strokeWidth="4" strokeDasharray="60 700"><animateTransform attributeName="transform" type="rotate" from="0 320 180" to="360 320 180" dur="6s" repeatCount="indefinite" /></circle>
      {stages.map((s,i) => {
        const rad = (s.a-90) * Math.PI / 180;
        const x = 320 + Math.cos(rad)*120;
        const y = 180 + Math.sin(rad)*120;
        return (
          <g key={i}>
            <circle cx={x} cy={y} r="32" fill="var(--card)" stroke="var(--accent)" strokeWidth="4" />
            <text x={x} y={y+12} textAnchor="middle" fontSize="32">{s.e}</text>
          </g>
        );
      })}
    </svg>
  );
}

function WeatherSvg({ compact: _c }: { compact: boolean }) {
  return (
    <svg viewBox={VB} role="img" aria-label="Clima" className={ASPECT}>
      <rect width="640" height="360" fill="var(--secondary)" />
      <circle cx="120" cy="100" r="40" fill="var(--accent)"><animate attributeName="r" values="36;44;36" dur="2.6s" repeatCount="indefinite" /></circle>
      <ellipse cx="380" cy="120" rx="100" ry="36" fill="var(--card)" />
      <ellipse cx="430" cy="100" rx="60" ry="28" fill="var(--card)" />
      <g stroke="var(--sky-foreground)" strokeWidth="6" strokeLinecap="round">
        {[0,1,2,3,4].map((i) => <line key={i} x1={340 + i*30} y1="160" x2={324 + i*30} y2="200" />)}
        <animateTransform attributeName="transform" type="translate" values="0 -10;0 30;0 -10" dur="1s" repeatCount="indefinite" />
      </g>
      <path d="M0 280 C160 250 480 310 640 270 L640 360 L0 360Z" fill="var(--mint)" opacity="0.6" />
    </svg>
  );
}

function RocketSvg({ compact: _c }: { compact: boolean }) {
  return (
    <svg viewBox={VB} role="img" aria-label="Cohete" className={ASPECT}>
      <rect width="640" height="360" fill="var(--secondary)" />
      {[...Array(20)].map((_,i) => <circle key={i} cx={(i*73)%640} cy={(i*53)%360} r="2" fill="var(--foreground)" opacity="0.4" />)}
      <g transform="translate(280 0)">
        <animateTransform attributeName="transform" type="translate" values="280 280;280 60;280 280" dur="4s" repeatCount="indefinite" />
        <path d="M40 40 C40 0 80 -10 80 40 L80 160 L40 160 Z" fill="var(--card)" stroke="var(--foreground)" strokeWidth="4" />
        <path d="M80 40 C80 0 40 -10 40 40 L40 160 L80 160 Z" fill="var(--coral)" stroke="var(--foreground)" strokeWidth="4" opacity="0.4" />
        <circle cx="60" cy="70" r="14" fill="var(--sky)" stroke="var(--foreground)" strokeWidth="3" />
        <polygon points="40,140 20,180 40,170" fill="var(--accent)" />
        <polygon points="80,140 100,180 80,170" fill="var(--accent)" />
        <g>
          <path d="M40 170 L60 220 L80 170 Z" fill="var(--coral)"><animate attributeName="d" values="M40 170 L60 220 L80 170 Z;M40 170 L60 240 L80 170 Z;M40 170 L60 220 L80 170 Z" dur="0.3s" repeatCount="indefinite" /></path>
        </g>
      </g>
    </svg>
  );
}

function WaveSvg({ compact: _c }: { compact: boolean }) {
  return (
    <svg viewBox={VB} role="img" aria-label="Onda" className={ASPECT}>
      <rect width="640" height="360" fill="var(--secondary)" />
      {[0,1,2].map((i) => (
        <path key={i} d="M0 180 Q80 80 160 180 T320 180 T480 180 T640 180" stroke={i===0?"var(--primary)":i===1?"var(--accent)":"var(--mint-foreground)"} strokeWidth="6" fill="none" opacity={0.8 - i*0.2}>
          <animate attributeName="d" values="M0 180 Q80 80 160 180 T320 180 T480 180 T640 180;M0 180 Q80 280 160 180 T320 180 T480 180 T640 180;M0 180 Q80 80 160 180 T320 180 T480 180 T640 180" dur={`${2+i*0.4}s`} repeatCount="indefinite" />
        </path>
      ))}
    </svg>
  );
}

function GenericSvg({ compact: _c }: { compact: boolean }) {
  return (
    <svg viewBox={VB} role="img" aria-label="Animación" className={ASPECT}>
      <rect width="640" height="360" fill="var(--secondary)" />
      {[0,1,2,3].map((i) => (
        <circle key={i} cx={170 + i*90} cy={180} r={34 + i*4} fill={i%2 ? "var(--accent)" : "var(--primary)"} opacity="0.72">
          <animate attributeName="cy" values={`${180};${130 + i*14};${180}`} dur={`${2.4 + i*0.25}s`} repeatCount="indefinite" />
        </circle>
      ))}
      <path d="M150 238 C236 282 372 82 496 130" stroke="var(--mint-foreground)" strokeWidth="10" strokeLinecap="round" fill="none" strokeDasharray="20 16">
        <animate attributeName="stroke-dashoffset" values="100;0" dur="2s" repeatCount="indefinite" />
      </path>
    </svg>
  );
}
