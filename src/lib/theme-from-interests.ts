/**
 * Generative UI theme: derives a "vibe" from the child's interests.
 * Pure heuristic — no AI needed for the base theme.
 * Used by every Gen* primitive so the whole UI shifts to the kid's world.
 */

export type Tone = "primary" | "coral" | "mint" | "sky" | "accent";

export interface GenTheme {
  id: string;
  label: string;
  tone: Tone;          // dominant color token
  accentTone: Tone;    // secondary
  motifs: string[];    // background emojis floating around
  particles: string[]; // burst particles on success
  cheers: string[];    // success phrases (mascot uses them)
  oops: string[];      // wrong-answer empathy phrases
  motion: "bouncy" | "smooth" | "snappy" | "epic";
}

const THEMES: GenTheme[] = [
  {
    id: "spider",
    label: "Telaraña Heroica",
    tone: "coral", accentTone: "primary",
    motifs: ["🕸️", "🕷️", "🏙️"],
    particles: ["🕸️", "✨", "💥"],
    cheers: ["¡Sentido arácnido on!", "¡Telaraña perfecta!", "¡Spider-acierto!"],
    oops: ["El Duende esquivó esa…", "Reajusta tus telarañas", "¡Otro intento, héroe!"],
    motion: "snappy",
  },
  {
    id: "bat",
    label: "Baticueva",
    tone: "primary", accentTone: "accent",
    motifs: ["🦇", "🌃", "💢"],
    particles: ["🦇", "✨", "⚡"],
    cheers: ["¡La Baticomputadora aprueba!", "¡Movimiento de leyenda!", "¡Bati-acierto!"],
    oops: ["El Guasón se ríe… aún.", "Reagrupa al equipo", "¡Otra estrategia, Robin!"],
    motion: "epic",
  },
  {
    id: "space",
    label: "Cosmos",
    tone: "primary", accentTone: "sky",
    motifs: ["🪐", "⭐", "🚀", "🌠"],
    particles: ["⭐", "✨", "🌟"],
    cheers: ["¡Órbita estable!", "¡Despegue perfecto!", "¡Misión cumplida, capitán!"],
    oops: ["Pequeña turbulencia…", "Recalcula la órbita", "¡Sigue empujando los motores!"],
    motion: "smooth",
  },
  {
    id: "dino",
    label: "Era Jurásica",
    tone: "mint", accentTone: "coral",
    motifs: ["🦖", "🌿", "🥚", "🌋"],
    particles: ["🦴", "🌱", "✨"],
    cheers: ["¡Rugido épico!", "¡Pisada perfecta!", "¡Eres el T-Rex de las respuestas!"],
    oops: ["El meteorito casi…", "Reactiva tu instinto", "¡Cazador, otra vez!"],
    motion: "bouncy",
  },
  {
    id: "game",
    label: "Modo Videojuego",
    tone: "sky", accentTone: "accent",
    motifs: ["🎮", "🕹️", "💎", "👾"],
    particles: ["💎", "⚡", "✨", "🟣"],
    cheers: ["+1 vida extra", "¡Combo x3!", "¡Logro desbloqueado!"],
    oops: ["Game over… reintentar", "Casi power-up", "¡Continúa, jugador 1!"],
    motion: "snappy",
  },
  {
    id: "princess",
    label: "Reino Mágico",
    tone: "coral", accentTone: "primary",
    motifs: ["✨", "👑", "🦄", "🌸"],
    particles: ["✨", "👑", "💖", "🌟"],
    cheers: ["¡Brillas como cristal!", "¡La corona es tuya!", "¡Magia perfecta!"],
    oops: ["Hechizo a medias…", "Vuelve a agitar la varita", "¡Tu reino te necesita!"],
    motion: "smooth",
  },
  {
    id: "auto",
    label: "Pista de Carreras",
    tone: "accent", accentTone: "coral",
    motifs: ["🏎️", "🏁", "🛞", "🔥"],
    particles: ["🏁", "💨", "✨"],
    cheers: ["¡Vuelta rápida!", "¡Pole position!", "¡Acelera al podio!"],
    oops: ["Pit-stop rápido", "Ajusta la dirección", "¡Vuelve a la pista!"],
    motion: "snappy",
  },
  {
    id: "robot",
    label: "Modo Robot",
    tone: "sky", accentTone: "primary",
    motifs: ["🤖", "⚙️", "🔌", "💡"],
    particles: ["⚡", "✨", "🔧"],
    cheers: ["Sistema: PERFECTO.", "Algoritmo activado.", "Compilado sin errores."],
    oops: ["Recalculando…", "Bug detectado, depura", "Sistema en pausa, reintenta"],
    motion: "snappy",
  },
  {
    id: "nature",
    label: "Bosque Vivo",
    tone: "mint", accentTone: "accent",
    motifs: ["🌳", "🍄", "🦋", "🌻"],
    particles: ["🍃", "🌸", "✨"],
    cheers: ["¡Floreciste!", "¡Vuelo de mariposa!", "¡El bosque celebra!"],
    oops: ["La semilla aún crece…", "Riega de nuevo", "Tu árbol te espera"],
    motion: "smooth",
  },
  {
    id: "default",
    label: "Aventura IGNO",
    tone: "primary", accentTone: "accent",
    motifs: ["⭐", "✨", "🎯"],
    particles: ["⭐", "✨", "🎉"],
    cheers: ["¡Gran respuesta!", "¡Eso es!", "¡Sigue así!"],
    oops: ["Casi…", "Buen intento", "¡Otra vez!"],
    motion: "bouncy",
  },
];

const KEYWORDS: { match: RegExp; id: string }[] = [
  { match: /spider|spiderman|ara[ñn]a/i, id: "spider" },
  { match: /bat|batman|murci[eé]lago|gotham/i, id: "bat" },
  { match: /espacio|space|astro|cohete|nasa|planeta|galax/i, id: "space" },
  { match: /dino|jurasic|jur[aá]sico|t-?rex|raptor/i, id: "dino" },
  { match: /roblox|minecraft|fortnite|videojuego|gamer|gaming|nintendo|mario|zelda|sonic|pok[eé]mon|pokemon/i, id: "game" },
  { match: /princes|disney|frozen|elsa|unicorn|unicorni|rapunzel|sirena|magia/i, id: "princess" },
  { match: /carro|auto|coche|f1|ferrari|porsche|hot ?wheels|carrera/i, id: "auto" },
  { match: /robot|androide|mech|tecnolog/i, id: "robot" },
  { match: /natural|bosque|jard[ií]n|planta|flor|mariposa|animal/i, id: "nature" },
];

export function themeFromInterests(interests: string[]): GenTheme {
  for (const it of interests) {
    for (const k of KEYWORDS) if (k.match.test(it)) return THEMES.find(t => t.id === k.id) ?? THEMES[THEMES.length - 1];
  }
  return THEMES[THEMES.length - 1];
}

export function toneClasses(tone: Tone): { bg: string; bgSoft: string; text: string; ring: string; border: string; gradient: string } {
  switch (tone) {
    case "coral":   return { bg: "bg-coral",   bgSoft: "bg-coral/15",   text: "text-coral-foreground",   ring: "ring-coral",   border: "border-coral",   gradient: "bg-coral"   };
    case "mint":    return { bg: "bg-mint",    bgSoft: "bg-mint/15",    text: "text-mint-foreground",    ring: "ring-mint",    border: "border-mint",    gradient: "bg-mint"    };
    case "sky":     return { bg: "bg-sky",     bgSoft: "bg-sky/15",     text: "text-sky-foreground",     ring: "ring-sky",     border: "border-sky",     gradient: "bg-sky"     };
    case "accent":  return { bg: "bg-accent",  bgSoft: "bg-accent/20",  text: "text-accent-foreground",  ring: "ring-accent",  border: "border-accent",  gradient: "bg-accent"  };
    case "primary":
    default:        return { bg: "bg-primary", bgSoft: "bg-primary/10", text: "text-primary-foreground", ring: "ring-primary", border: "border-primary", gradient: "bg-primary" };
  }
}