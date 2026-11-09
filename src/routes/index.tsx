import { createFileRoute, Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { ArrowRight, Check, Gauge, MessageCircle, Sparkles, Trophy } from "lucide-react";
import { Companion } from "@/components/companion/Companion";
import { CHARACTER_LIST } from "@/components/companion/characters";
import { useLang } from "@/lib/i18n";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/")({ component: Landing });

const T = {
  es: {
    eyebrow: "Tutor con IA para toda la familia",
    h1a: "Aprende",
    h1hl: "a tu manera,",
    h1b: "al ritmo de cada quien.",
    meet: "Conoce a la pandilla",
    meetSub: "Cuatro compañeros, cuatro maneras de estudiar. Cada quien elige el suyo.",
    note: "¡Nada de clases aburridas!",
    sub: "IGNOTO crea cada lección en el momento a partir de lo que te gusta y de tu nivel. Para niños desde 4 años y para adultos que quieren seguir aprendiendo.",
    cta: "Crear cuenta",
    ctaAlt: "Cómo funciona",
    facts: [
      "Lecciones nuevas en segundos",
      "Niños y adultos en una cuenta",
      "Progreso visible para la familia",
    ],
    hello: "Hola, soy Igno",
    whyTag: "Por qué",
    whyH: "Nadie aprende igual. Las clases casi siempre sí.",
    whySub:
      "Mismo ejemplo, mismo ritmo y mismo tono para todos. Así es fácil perder el interés, quedarse atrás o aburrirse.",
    why: [
      {
        t: "Se pierde el interés",
        d: "Si el ejemplo no tiene nada que ver contigo, la idea no se queda.",
      },
      {
        t: "Se pierde la confianza",
        d: "Ir más lento que el grupo enseña comparación, no el tema.",
      },
      {
        t: "Se olvida rápido",
        d: "Memorizar sin contexto dura una semana. Entender dura mucho más.",
      },
    ],
    featTag: "Qué hace IGNOTO",
    featH: "Un tutor que se adapta a ti, no al revés.",
    features: [
      {
        t: "Parte de lo que te gusta",
        d: "Dinosaurios, fútbol o finanzas personales: tu interés se vuelve el ejemplo con el que se explica cada tema.",
      },
      {
        t: "Ajusta la dificultad sola",
        d: "Cada respuesta afina la siguiente lección. Si algo cuesta, cambia la explicación; si es fácil, sube el reto.",
      },
      {
        t: "Responde con voz",
        d: "Pregunta escribiendo o hablando. Tu compañero contesta en voz alta, con animaciones, quizzes y retos.",
      },
      {
        t: "Motiva sin presionar",
        d: "Puntos, rachas y un mapa de avance personal. Sin rankings públicos ni comparaciones.",
      },
    ],
    demoTag: "Personalización",
    demoH: "El mismo tema, explicado para cada persona.",
    demoSub: "Así cambia una explicación de fracciones según quién aprende:",
    demo: [
      {
        who: "Mateo, 7 años",
        like: "Le encantan los dinosaurios",
        q: "Un T-Rex se comió ¾ de su comida. ¿Qué parte le queda para mañana?",
      },
      {
        who: "Sofía, 10 años",
        like: "Juega fútbol",
        q: "Tu equipo anotó 2 de 5 tiros a gol. ¿Qué fracción de los tiros fue gol?",
      },
      {
        who: "Ana, 34 años",
        like: "Quiere ordenar sus finanzas",
        q: "Destinas ⅓ de tu ingreso a la renta y ¼ al ahorro. ¿Qué fracción te queda para lo demás?",
      },
    ],
    modesTag: "Dos experiencias",
    modesH: "Pensado para niños. Útil para adultos.",
    kidsT: "Para niños",
    kidsD:
      "Colores, compañeros con personalidad, retos cortos y explicaciones con su mundo favorito.",
    kids: [
      "Desde preescolar hasta preparatoria",
      "Lecciones de 5 a 30 minutos",
      "Compañero que reacciona a sus respuestas",
    ],
    adultsT: "Para adultos",
    adultsD: "Interfaz sobria, ejemplos de la vida real y un tono de mentor, no de caricatura.",
    adults: [
      "Finanzas, idiomas, IA, historia y más",
      "Explicaciones precisas y prácticas",
      "Ideal para aprender junto a tus hijos",
    ],
    howTag: "Cómo funciona",
    howH: "Empieza en menos de dos minutos.",
    steps: [
      { t: "Crea tu cuenta familiar", d: "Una sola cuenta para todos los que aprenden en casa." },
      {
        t: "Agrega perfiles",
        d: "Edad, intereses y materias de cada niño o adulto. Cada quien elige su compañero.",
      },
      {
        t: "Aprende y avanza",
        d: "Cada lección se crea en el momento y la siguiente llega mejor ajustada.",
      },
    ],
    familyTag: "Para familias",
    familyH: "Acompaña sin estar encima.",
    family: [
      {
        t: "Reporte de progreso",
        d: "Qué aprendió cada quien, qué le costó y qué sigue, en lenguaje claro.",
      },
      {
        t: "Sin comparaciones",
        d: "Cada perfil ve solo su propio avance. No hay tablas públicas.",
      },
      {
        t: "Un lugar para todos",
        d: "Cambia de perfil en un toque: cada uno conserva su progreso y su estilo.",
      },
      {
        t: "Habla o escribe",
        d: "Los más pequeños pueden preguntar con la voz, sin necesidad de escribir.",
      },
    ],
    finalH: "Tu primera lección está a dos minutos.",
    finalSub: "Crea la cuenta, agrega un perfil y deja que IGNOTO prepare algo hecho a la medida.",
    footer: "Aprendizaje con IA para niños y adultos.",
    signIn: "Entrar",
  },
  en: {
    eyebrow: "AI tutor for the whole family",
    h1a: "Learn",
    h1hl: "your way,",
    h1b: "at everyone's own pace.",
    meet: "Meet the crew",
    meetSub: "Four companions, four ways to study. Everyone picks their own.",
    note: "No more boring classes!",
    sub: "IGNOTO builds each lesson on the spot from what you love and your level. For kids from age 4 and for adults who want to keep learning.",
    cta: "Create account",
    ctaAlt: "How it works",
    facts: [
      "New lessons in seconds",
      "Kids and adults in one account",
      "Progress the family can see",
    ],
    hello: "Hi, I'm Igno",
    whyTag: "Why",
    whyH: "Nobody learns the same way. Classes almost always teach that way.",
    whySub:
      "Same example, same pace and same tone for everyone. That makes it easy to lose interest, fall behind or get bored.",
    why: [
      {
        t: "Interest fades",
        d: "If the example has nothing to do with you, the idea doesn't stick.",
      },
      {
        t: "Confidence drops",
        d: "Going slower than the group teaches comparison, not the topic.",
      },
      {
        t: "It's forgotten fast",
        d: "Memorizing without context lasts a week. Understanding lasts much longer.",
      },
    ],
    featTag: "What IGNOTO does",
    featH: "A tutor that adapts to you, not the other way around.",
    features: [
      {
        t: "Starts from what you love",
        d: "Dinosaurs, soccer or personal finance: your interest becomes the example used to explain every topic.",
      },
      {
        t: "Adjusts difficulty on its own",
        d: "Each answer tunes the next lesson. If something is hard, the explanation changes; if it's easy, the challenge grows.",
      },
      {
        t: "Answers out loud",
        d: "Ask by typing or speaking. Your companion replies by voice, with animations, quizzes and challenges.",
      },
      {
        t: "Motivates without pressure",
        d: "Points, streaks and a personal progress map. No public rankings or comparisons.",
      },
    ],
    demoTag: "Personalization",
    demoH: "The same topic, explained for each person.",
    demoSub: "Here's how an explanation of fractions changes depending on who's learning:",
    demo: [
      {
        who: "Mateo, 7",
        like: "Loves dinosaurs",
        q: "A T-Rex ate ¾ of its food. What part is left for tomorrow?",
      },
      {
        who: "Sofía, 10",
        like: "Plays soccer",
        q: "Your team scored on 2 of 5 shots. What fraction of the shots were goals?",
      },
      {
        who: "Ana, 34",
        like: "Wants to sort out her finances",
        q: "You spend ⅓ of your income on rent and save ¼. What fraction is left for everything else?",
      },
    ],
    modesTag: "Two experiences",
    modesH: "Designed for kids. Useful for adults.",
    kidsT: "For kids",
    kidsD:
      "Color, companions with personality, short challenges and explanations set in their favorite world.",
    kids: [
      "Preschool through high school",
      "Lessons from 5 to 30 minutes",
      "A companion that reacts to their answers",
    ],
    adultsT: "For adults",
    adultsD: "A calm interface, real-life examples and a mentor's tone, not a cartoon's.",
    adults: [
      "Finance, languages, AI, history and more",
      "Precise, practical explanations",
      "Great for learning alongside your kids",
    ],
    howTag: "How it works",
    howH: "Get started in under two minutes.",
    steps: [
      { t: "Create your family account", d: "One account for everyone learning at home." },
      {
        t: "Add profiles",
        d: "Age, interests and subjects for each child or adult. Everyone picks a companion.",
      },
      {
        t: "Learn and progress",
        d: "Each lesson is built on the spot, and the next one arrives better tuned.",
      },
    ],
    familyTag: "For families",
    familyH: "Stay involved without hovering.",
    family: [
      {
        t: "Progress reports",
        d: "What each person learned, what was hard and what's next, in plain language.",
      },
      {
        t: "No comparisons",
        d: "Each profile only sees its own progress. No public leaderboards.",
      },
      {
        t: "One place for everyone",
        d: "Switch profiles in a tap: each keeps its own progress and style.",
      },
      { t: "Speak or type", d: "Little ones can ask out loud, no typing needed." },
    ],
    finalH: "Your first lesson is two minutes away.",
    finalSub: "Create the account, add a profile and let IGNOTO prepare something made to measure.",
    footer: "AI learning for kids and adults.",
    signIn: "Sign in",
  },
} as const;

const FEATURE_ICONS = [Sparkles, Gauge, MessageCircle, Trophy];
const FEATURE_TONES = ["bg-pink", "bg-lime", "bg-mint", "bg-sky"];
const NOTE_TONES = ["bg-[#fff27a]", "bg-pink", "bg-mint"];
const TILTS = ["-rotate-2", "rotate-1", "-rotate-1", "rotate-2"];

function Section({
  id,
  tag,
  title,
  sub,
  children,
  tone,
}: {
  id?: string;
  tag: string;
  title: string;
  sub?: string;
  children: ReactNode;
  tone?: "pink" | "lime";
}) {
  const bg = tone === "pink" ? "bg-pink checker border-y-[2.5px] border-ink" : tone === "lime" ? "bg-lime border-y-[2.5px] border-ink" : "";
  return (
    <section id={id} className={bg}>
      <div className="max-w-6xl mx-auto px-5 py-20 md:py-28">
        <div className="max-w-2xl mb-12">
          <p className="font-hand text-2xl -rotate-2 inline-block">{tag}</p>
          <h2 className="font-display text-4xl md:text-6xl mt-1">{title}</h2>
          {sub && <p className="text-lg mt-4 text-foreground/75">{sub}</p>}
        </div>
        {children}
      </div>
    </section>
  );
}

function Landing() {
  const t = useT(T);
  const { lang } = useLang();
  return (
    <main className="overflow-x-clip">
      {/* HERO */}
      <section className="relative max-w-6xl mx-auto px-5 pt-12 pb-20 md:pt-20 md:pb-28 grid md:grid-cols-[1.1fr_1fr] gap-14 items-center">
        <div className="relative">
          <p className="inline-flex items-center gap-2 rounded-full border-2 border-ink bg-card px-3 py-1 text-sm font-semibold">
            <span className="h-2.5 w-2.5 rounded-full bg-primary border border-ink" aria-hidden />
            {t.eyebrow}
          </p>
          <h1 className="font-display text-[3.2rem] leading-[0.98] md:text-[5.4rem] mt-6">
            {t.h1a} <span className="highlight whitespace-nowrap">{t.h1hl}</span> {t.h1b}
          </h1>
          <p className="text-lg md:text-xl text-foreground/75 mt-6 max-w-xl">{t.sub}</p>
          <div className="flex flex-wrap gap-4 mt-8">
            <Link to="/auth" className="btn-sticker bg-primary text-primary-foreground px-6 py-3.5 text-lg">
              {t.cta} <ArrowRight className="h-5 w-5" />
            </Link>
            <a href="#como" className="btn-sticker bg-card px-6 py-3.5 text-lg">
              {t.ctaAlt}
            </a>
          </div>
          <ul className="mt-10 flex flex-wrap gap-x-6 gap-y-2 text-sm font-semibold">
            {t.facts.map((f) => (
              <li key={f} className="flex items-center gap-1.5">
                <span className="grid h-5 w-5 place-items-center rounded-full border-2 border-ink bg-mint">
                  <Check className="h-3 w-3" strokeWidth={3} />
                </span>
                {f}
              </li>
            ))}
          </ul>
        </div>
        <HeroBoard hello={t.hello} note={t.note} />
      </section>

      {/* LA PANDILLA */}
      <Section tag={t.meet} title={t.meetSub} tone="pink">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {CHARACTER_LIST.map((c, i) => (
            <div key={c.id} className={`rounded-3xl bg-card sticker p-5 text-center ${TILTS[i]} hover:rotate-0 transition-transform`}>
              <div className="flex justify-center">
                <Companion id={c.id} size={128} />
              </div>
              <h3 className="font-display text-3xl mt-2">{c.name}</h3>
              <p className="text-sm font-semibold text-foreground/70">{c.tagline[lang]}</p>
              <p className="font-hand text-xl mt-3 leading-tight">“{c.line[lang]}”</p>
            </div>
          ))}
        </div>
      </Section>

      {/* POR QUÉ */}
      <Section tag={t.whyTag} title={t.whyH} sub={t.whySub}>
        <ol className="grid md:grid-cols-3 gap-6">
          {t.why.map((x, i) => (
            <li key={x.t} className={`tape relative rounded-md ${NOTE_TONES[i]} border-2 border-ink p-7 shadow-[4px_5px_0_var(--ink)] ${TILTS[i]}`}>
              <span className="font-hand text-3xl">0{i + 1}.</span>
              <h3 className="font-display text-2xl mt-2">{x.t}</h3>
              <p className="mt-2 text-foreground/80">{x.d}</p>
            </li>
          ))}
        </ol>
      </Section>

      {/* QUÉ HACE */}
      <Section tag={t.featTag} title={t.featH}>
        <div className="grid sm:grid-cols-2 gap-6">
          {t.features.map((f, i) => {
            const Icon = FEATURE_ICONS[i];
            return (
              <div key={f.t} className="rounded-3xl bg-card sticker p-7">
                <div className={`grid h-12 w-12 place-items-center rounded-xl border-2 border-ink ${FEATURE_TONES[i]}`}>
                  <Icon className="h-6 w-6" strokeWidth={2.25} />
                </div>
                <h3 className="font-display text-2xl mt-5">{f.t}</h3>
                <p className="text-foreground/75 mt-2">{f.d}</p>
              </div>
            );
          })}
        </div>
      </Section>

      {/* PERSONALIZACIÓN */}
      <Section tag={t.demoTag} title={t.demoH} sub={t.demoSub} tone="lime">
        <div className="grid md:grid-cols-3 gap-6">
          {t.demo.map((c, i) => (
            <figure key={c.who} className="paper-lines rounded-2xl border-[2.5px] border-ink shadow-[4px_4px_0_var(--ink)] p-6 pl-14 flex flex-col">
              <figcaption className="flex items-center gap-3">
                <Companion id={CHARACTER_LIST[i].id} size={48} interactive={false} />
                <div>
                  <div className="font-bold">{c.who}</div>
                  <div className="text-sm text-foreground/65">{c.like}</div>
                </div>
              </figcaption>
              <blockquote className="mt-4 font-hand text-2xl leading-[1.85rem]">{c.q}</blockquote>
            </figure>
          ))}
        </div>
      </Section>

      {/* NIÑOS / ADULTOS */}
      <Section tag={t.modesTag} title={t.modesH}>
        <div className="grid md:grid-cols-2 gap-6">
          <ModeCard companion="chispa" title={t.kidsT} desc={t.kidsD} items={t.kids} tone="bg-pink" />
          <ModeCard companion="bolt" title={t.adultsT} desc={t.adultsD} items={t.adults} tone="bg-sky" />
        </div>
      </Section>

      {/* CÓMO FUNCIONA */}
      <Section id="como" tag={t.howTag} title={t.howH} tone="pink">
        <ol className="grid md:grid-cols-3 gap-6">
          {t.steps.map((s, i) => (
            <li key={s.t} className="rounded-3xl bg-card sticker p-7">
              <span className="font-display text-6xl text-sticker">{i + 1}</span>
              <h3 className="font-display text-2xl mt-3">{s.t}</h3>
              <p className="text-foreground/75 mt-2">{s.d}</p>
            </li>
          ))}
        </ol>
      </Section>

      {/* FAMILIAS */}
      <Section tag={t.familyTag} title={t.familyH}>
        <div className="grid sm:grid-cols-2 gap-x-10 gap-y-8 max-w-4xl">
          {t.family.map((p) => (
            <div key={p.t} className="flex gap-4">
              <span className="mt-1 grid h-7 w-7 flex-shrink-0 place-items-center rounded-lg border-2 border-ink bg-lime">
                <Check className="h-4 w-4" strokeWidth={3} />
              </span>
              <div>
                <h3 className="font-display text-xl">{p.t}</h3>
                <p className="text-foreground/75 mt-1">{p.d}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* CTA */}
      <section className="px-5 pb-24">
        <div className="relative overflow-hidden max-w-6xl mx-auto rounded-[2rem] bg-ink text-white border-[2.5px] border-ink shadow-[6px_6px_0_var(--primary)] px-8 pt-14 pb-40 md:px-16 md:pt-20 md:pb-20 md:min-h-[420px]">
          <div className="relative z-10 md:max-w-[52%]">
            <h2 className="font-display text-4xl md:text-6xl">{t.finalH}</h2>
            <p className="mt-4 text-lg text-white/75 max-w-xl">{t.finalSub}</p>
            <Link to="/auth" className="btn-sticker mt-8 bg-lime text-ink px-6 py-3.5 text-lg !border-white !shadow-[3px_3px_0_#fff]">
              {t.cta} <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
          {/* The crew peeking up from the bottom edge. */}
          <div className="pointer-events-none absolute bottom-0 right-0 flex items-end gap-1 md:gap-3 translate-y-[18%] md:right-8" aria-hidden>
            <Companion id="chispa" size={130} className="rotate-[-8deg]" />
            <Companion id="igno" size={190} />
            <Companion id="bolt" size={120} className="rotate-[10deg]" />
            <Companion id="luna" size={160} className="hidden sm:inline-block" />
          </div>
        </div>
      </section>

      <footer className="border-t-[2.5px] border-ink bg-background">
        <div className="max-w-6xl mx-auto px-5 py-8 flex flex-wrap items-center gap-4 text-sm">
          <span className="font-display text-2xl text-sticker -rotate-2">IGNOTO</span>
          <span className="text-foreground/70">{t.footer}</span>
          <span className="ml-auto flex gap-5 text-foreground/70">
            <Link to="/auth" className="font-semibold hover:text-foreground">
              {t.signIn}
            </Link>
            <span>© {new Date().getFullYear()}</span>
          </span>
        </div>
      </footer>
    </main>
  );
}

function ModeCard({
  companion,
  title,
  desc,
  items,
  tone,
}: {
  companion: "chispa" | "bolt";
  title: string;
  desc: string;
  items: readonly string[];
  tone: string;
}) {
  return (
    <div className={`rounded-3xl p-8 sticker ${tone}`}>
      <Companion id={companion} size={96} />
      <h3 className="font-display text-3xl mt-4">{title}</h3>
      <p className="text-foreground/75 mt-2">{desc}</p>
      <ul className="mt-6 space-y-2.5 font-semibold">
        {items.map((it) => (
          <li key={it} className="flex items-start gap-2">
            <span className="mt-0.5 grid h-5 w-5 flex-shrink-0 place-items-center rounded-full border-2 border-ink bg-card">
              <Check className="h-3 w-3" strokeWidth={3} />
            </span>
            {it}
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Desk scene: a notebook page with Igno, a sticky note and the rest of the crew. */
function HeroBoard({ hello, note }: { hello: string; note: string }) {
  const [, chispa, bolt, luna] = CHARACTER_LIST;
  return (
    <div className="relative mx-auto w-full max-w-[440px] pt-6" aria-hidden>
      <div className="paper-lines relative rounded-2xl border-[2.5px] border-ink shadow-[6px_6px_0_var(--ink)] px-6 pt-10 pb-8 -rotate-1">
        <div className="flex flex-col items-center">
          <Companion id="igno" size={190} />
          <span className="mt-2 rounded-full border-2 border-ink bg-card px-4 py-1.5 font-bold shadow-[2px_2px_0_var(--ink)]">
            {hello}
          </span>
        </div>
      </div>
      <div className="tape absolute -top-2 -right-3 w-36 rotate-6 rounded-sm border-2 border-ink bg-[#fff27a] p-3 shadow-[3px_4px_0_var(--ink)]">
        <p className="font-hand text-2xl leading-6">{note}</p>
      </div>
      <div className="mt-5 grid grid-cols-3 gap-3">
        {[
          { c: chispa, bg: "bg-sky", r: "rotate-2" },
          { c: bolt, bg: "bg-lime", r: "-rotate-2" },
          { c: luna, bg: "bg-pink", r: "rotate-1" },
        ].map(({ c, bg, r }) => (
          <div key={c.id} className={`relative aspect-square overflow-hidden rounded-2xl sticker ${bg} ${r}`}>
            <Companion id={c.id} size={128} className="absolute left-1/2 bottom-0 -translate-x-1/2 translate-y-[16%]" />
          </div>
        ))}
      </div>
    </div>
  );
}
