import { createFileRoute, Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { ArrowRight, Check, Gauge, MessageCircle, Sparkles, Trophy } from "lucide-react";
import { Companion } from "@/components/companion/Companion";
import { CHARACTER_LIST } from "@/components/companion/characters";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/")({ component: Landing });

const T = {
  es: {
    eyebrow: "Tutor con IA para toda la familia",
    h1a: "Aprende a tu manera,",
    h1b: "al ritmo de cada quien.",
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
    h1a: "Learn your way,",
    h1b: "at everyone's own pace.",
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
const FEATURE_TONES = [
  "bg-primary/12 text-primary",
  "bg-accent/30 text-accent-foreground",
  "bg-mint/40 text-mint-foreground",
  "bg-sky/40 text-sky-foreground",
];

function Section({
  id,
  tag,
  title,
  sub,
  children,
  muted,
}: {
  id?: string;
  tag: string;
  title: string;
  sub?: string;
  children: ReactNode;
  muted?: boolean;
}) {
  return (
    <section id={id} className={muted ? "bg-secondary/60 border-y border-border" : ""}>
      <div className="max-w-6xl mx-auto px-5 py-20 md:py-28">
        <div className="max-w-2xl mb-12">
          <p className="text-sm font-semibold text-primary">{tag}</p>
          <h2 className="font-display text-3xl md:text-[2.75rem] mt-2">{title}</h2>
          {sub && <p className="text-muted-foreground text-lg mt-4">{sub}</p>}
        </div>
        {children}
      </div>
    </section>
  );
}

function Landing() {
  const t = useT(T);
  return (
    <main>
      {/* HERO */}
      <section className="max-w-6xl mx-auto px-5 pt-14 pb-20 md:pt-24 md:pb-28 grid md:grid-cols-[1.15fr_1fr] gap-14 items-center">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-sm font-medium text-muted-foreground">
            <span className="h-2 w-2 rounded-full bg-mint" aria-hidden />
            {t.eyebrow}
          </p>
          <h1 className="font-display text-[2.75rem] leading-[1.02] md:text-7xl mt-6">
            {t.h1a} <span className="text-primary">{t.h1b}</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mt-6 max-w-xl">{t.sub}</p>
          <div className="flex flex-wrap gap-3 mt-8">
            <Link
              to="/auth"
              className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-6 py-3.5 font-semibold shadow-pop hover:brightness-110 transition"
            >
              {t.cta} <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="#como"
              className="rounded-full border border-border bg-card px-6 py-3.5 font-semibold hover:bg-muted transition-colors"
            >
              {t.ctaAlt}
            </a>
          </div>
          <ul className="mt-10 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
            {t.facts.map((f) => (
              <li key={f} className="flex items-center gap-1.5">
                <Check className="h-4 w-4 text-primary" /> {f}
              </li>
            ))}
          </ul>
        </div>
        <HeroCompanions hello={t.hello} />
      </section>

      {/* POR QUÉ */}
      <Section tag={t.whyTag} title={t.whyH} sub={t.whySub} muted>
        <ol className="grid md:grid-cols-3 gap-px rounded-3xl overflow-hidden border border-border bg-border">
          {t.why.map((x, i) => (
            <li key={x.t} className="bg-card p-7">
              <span className="font-display text-sm text-muted-foreground tabular-nums">
                0{i + 1}
              </span>
              <h3 className="font-display text-xl mt-3">{x.t}</h3>
              <p className="text-muted-foreground mt-2">{x.d}</p>
            </li>
          ))}
        </ol>
      </Section>

      {/* QUÉ HACE */}
      <Section tag={t.featTag} title={t.featH}>
        <div className="grid sm:grid-cols-2 gap-5">
          {t.features.map((f, i) => {
            const Icon = FEATURE_ICONS[i];
            return (
              <div key={f.t} className="rounded-3xl border border-border bg-card p-7">
                <div className={`grid h-11 w-11 place-items-center rounded-xl ${FEATURE_TONES[i]}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-display text-xl mt-5">{f.t}</h3>
                <p className="text-muted-foreground mt-2">{f.d}</p>
              </div>
            );
          })}
        </div>
      </Section>

      {/* PERSONALIZACIÓN */}
      <Section tag={t.demoTag} title={t.demoH} sub={t.demoSub} muted>
        <div className="grid md:grid-cols-3 gap-5">
          {t.demo.map((c, i) => (
            <figure
              key={c.who}
              className="rounded-3xl bg-card border border-border p-6 flex flex-col"
            >
              <figcaption className="flex items-center gap-3">
                <Companion id={CHARACTER_LIST[i].id} size={44} interactive={false} />
                <div>
                  <div className="font-semibold">{c.who}</div>
                  <div className="text-sm text-muted-foreground">{c.like}</div>
                </div>
              </figcaption>
              <blockquote className="mt-5 text-lg leading-snug">“{c.q}”</blockquote>
            </figure>
          ))}
        </div>
      </Section>

      {/* NIÑOS / ADULTOS */}
      <Section tag={t.modesTag} title={t.modesH}>
        <div className="grid md:grid-cols-2 gap-5">
          <ModeCard
            companion="chispa"
            title={t.kidsT}
            desc={t.kidsD}
            items={t.kids}
            tone="bg-accent/25"
          />
          <ModeCard
            companion="bolt"
            title={t.adultsT}
            desc={t.adultsD}
            items={t.adults}
            tone="bg-secondary"
          />
        </div>
      </Section>

      {/* CÓMO FUNCIONA */}
      <Section id="como" tag={t.howTag} title={t.howH} muted>
        <ol className="grid md:grid-cols-3 gap-5">
          {t.steps.map((s, i) => (
            <li key={s.t} className="rounded-3xl bg-card border border-border p-7">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-primary text-primary-foreground font-display font-semibold">
                {i + 1}
              </span>
              <h3 className="font-display text-xl mt-5">{s.t}</h3>
              <p className="text-muted-foreground mt-2">{s.d}</p>
            </li>
          ))}
        </ol>
      </Section>

      {/* FAMILIAS */}
      <Section tag={t.familyTag} title={t.familyH}>
        <div className="grid sm:grid-cols-2 gap-x-10 gap-y-8 max-w-4xl">
          {t.family.map((p) => (
            <div key={p.t} className="flex gap-4">
              <Check className="h-5 w-5 mt-1 flex-shrink-0 text-primary" />
              <div>
                <h3 className="font-display text-lg">{p.t}</h3>
                <p className="text-muted-foreground mt-1">{p.d}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* CTA */}
      <section className="px-5 pb-24">
        <div className="max-w-6xl mx-auto rounded-[2rem] bg-foreground text-background px-8 py-14 md:px-16 md:py-20 grid md:grid-cols-[1fr_auto] gap-10 items-center">
          <div>
            <h2 className="font-display text-3xl md:text-5xl">{t.finalH}</h2>
            <p className="mt-4 text-lg opacity-75 max-w-xl">{t.finalSub}</p>
            <Link
              to="/auth"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-background text-foreground px-6 py-3.5 font-semibold hover:opacity-90 transition"
            >
              {t.cta} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="hidden md:flex gap-3">
            {CHARACTER_LIST.map((c) => (
              <Companion key={c.id} id={c.id} size={76} interactive={false} />
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-border">
        <div className="max-w-6xl mx-auto px-5 py-8 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <span className="font-display text-base font-semibold text-foreground">IGNOTO</span>
          <span>{t.footer}</span>
          <span className="ml-auto flex gap-5">
            <Link to="/auth" className="hover:text-foreground">
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
    <div className={`rounded-3xl p-8 ${tone}`}>
      <Companion id={companion} size={72} />
      <h3 className="font-display text-2xl mt-5">{title}</h3>
      <p className="text-muted-foreground mt-2">{desc}</p>
      <ul className="mt-6 space-y-2.5">
        {items.map((it) => (
          <li key={it} className="flex items-start gap-2">
            <Check className="h-4 w-4 mt-1 text-primary flex-shrink-0" /> {it}
          </li>
        ))}
      </ul>
    </div>
  );
}

/** The four companions; their eyes follow the visitor's pointer. */
function HeroCompanions({ hello }: { hello: string }) {
  const [igno, chispa, bolt, luna] = CHARACTER_LIST;
  return (
    <div className="relative mx-auto grid w-full max-w-[420px] grid-cols-3 gap-4" aria-hidden>
      <div className="col-span-3 flex flex-col items-center rounded-[2rem] bg-primary/8 border border-border pt-8 pb-6">
        <Companion id={igno.id} size={170} />
        <span className="mt-3 rounded-full bg-card border border-border px-4 py-1.5 text-sm font-semibold">
          {hello}
        </span>
      </div>
      {[
        { c: chispa, bg: "bg-accent/20" },
        { c: bolt, bg: "bg-mint/30" },
        { c: luna, bg: "bg-sky/30" },
      ].map(({ c, bg }) => (
        <div
          key={c.id}
          className={`flex aspect-square items-center justify-center rounded-[1.5rem] border border-border ${bg}`}
        >
          <Companion id={c.id} size={72} />
        </div>
      ))}
    </div>
  );
}
