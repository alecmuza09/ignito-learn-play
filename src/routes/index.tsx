import { createFileRoute, Link } from "@tanstack/react-router";
import { KawaiiBlob } from "@/components/KawaiiBlob";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/")({ component: Landing });

const T = {
  es: {
    badge: "⚡ Aprendizaje a la medida",
    h1a: "Cada niño aprende",
    h1b: "distinto",
    h1c: ". Por fin una app que lo entiende.",
    sub: "IGNOTO genera cada lección desde cero usando lo que tu hijo sabe, cómo aprende y lo que le apasiona. Si le gustan los dinosaurios, las fracciones se explican con dinosaurios. Si va más rápido, la dificultad sube. Si se atasca, IGNO lo acompaña con otra explicación.",
    cta1: "Empezar la aventura →",
    cta2: "¿Por qué importa?",
    social: "+1,000 niños ya están aprendiendo así",
    hello: "¡Hola! Soy IGNO",
    problemTag: "El problema",
    problemH: "El colegio enseña a 30 niños igual. Pero ningún niño aprende igual.",
    problemSub: "Mismas explicaciones, mismos ejemplos, mismo ritmo. Al que va rápido le aburre. Al que va lento le abruma. Y a casi nadie le hablan en su propio lenguaje.",
    problems: [
      { i: "😴", t: "Se desconectan", d: "Cuando el contenido no conecta con lo que les importa, el cerebro lo descarta." },
      { i: "📉", t: "Pierden confianza", d: "Quedarse atrás en grupo enseña más sobre comparación que sobre el tema." },
      { i: "🔁", t: "Olvidan rápido", d: "Memorizar sin contexto = información que se evapora en una semana." },
    ],
    solTag: "La solución",
    solH: "Una clase distinta para cada niño, cada día.",
    solSub: "IGNOTO no es un curso pregrabado. Es un tutor con IA que arma la lección en el momento, usando el contexto único de tu hijo.",
    features: [
      { c: "primary", i: "🎯", t: "Aprende con lo que ama", d: "¿Le gustan los planetas, K-pop o el fútbol? Ese mundo se vuelve el escenario donde se enseñan matemáticas, lectura o ciencias. La motivación deja de ser un problema." },
      { c: "coral", i: "📊", t: "Se ajusta a su nivel real", d: "Cada respuesta ajusta la siguiente lección. Si dominó algo, sube. Si dudó, IGNO repite con otra analogía. Sin grupos rígidos ni etiquetas." },
      { c: "accent", i: "🦉", t: "Un tutor que escucha", d: "IGNO responde dudas en lenguaje de niño, con ejemplos visuales y animaciones generadas. Pueden preguntar lo que quieran, sin pena." },
      { c: "mint", i: "🎮", t: "Aprender no se siente como tarea", d: "XP, racha, mapa épico, recompensas. La estructura de un videojuego sostiene la atención donde un PDF la pierde." },
    ],
    persoH: "El mismo tema, contado para cada niño",
    persoSub1: "Así se ve enseñar ",
    persoSub2: " en IGNOTO según los intereses del niño:",
    persoTopic: "fracciones",
    cards: [
      { e: "🦖", n: "Para Mateo, 7", g: "Ama dinosaurios", q: "Si un T-Rex se come ¾ de un brontosaurio, ¿cuánto queda para mañana?" },
      { e: "⚽", n: "Para Sofía, 8", g: "Vive el fútbol", q: "El equipo metió 2 goles de los 5 tiros. ¿Qué fracción acertaron?" },
      { e: "🎨", n: "Para Lía, 6", g: "Pinta todo el día", q: "Si tu paleta tiene 8 colores y usas 3, ¿qué fracción te falta probar?" },
    ],
    howH: "Cómo funciona",
    steps: [
      { n: 1, t: "Cuéntanos quién es", d: "Edad, nivel, idioma, intereses y materias favoritas. Esa información es la base de todo." },
      { n: 2, t: "IGNOTO arma su mundo", d: "Genera un plan único, un mapa de lecciones y un tutor IGNO con la voz adecuada para su edad." },
      { n: 3, t: "Aprende y se ajusta solo", d: "Cada respuesta enseña a IGNOTO cómo piensa tu hijo. La siguiente lección llega más afinada." },
    ],
    princH: "En lo que creemos",
    principles: [
      { i: "🌱", t: "El contexto enseña, no el contenido", d: "Un dato suelto se olvida. Un dato dentro de algo que le importa al niño se queda." },
      { i: "🧭", t: "Cada niño marca su ritmo", d: "Avanzar más rápido o más lento no es bueno ni malo. Es información para enseñar mejor." },
      { i: "🛡️", t: "Sin presión social", d: "Aquí no hay rankings públicos ni comparaciones. Solo el progreso de tu hijo, con su mascota." },
      { i: "👪", t: "Padres como aliados", d: "Verás qué aprendió, qué le costó y qué le encantó. Para acompañar sin invadir." },
    ],
    ctaH: "Una lección hecha para tu hijo, esperándolo",
    ctaSub: "Cuéntanos quién es y deja que IGNOTO haga el resto. Sin contraseñas complicadas, sin fricciones — solo aprendizaje real, en su propio idioma.",
    ctaBtn: "Crear mi perfil →",
    footer: "Hecho con 💜 para niños curiosos",
  },
  en: {
    badge: "⚡ Learning that fits",
    h1a: "Every child learns",
    h1b: "differently",
    h1c: ". Finally, an app that gets it.",
    sub: "IGNOTO builds every lesson from scratch using what your child knows, how they learn, and what they love. If they love dinosaurs, fractions are taught with dinosaurs. If they go faster, difficulty rises. If they get stuck, IGNO walks them through another way.",
    cta1: "Start the adventure →",
    cta2: "Why it matters",
    social: "+1,000 kids already learning this way",
    hello: "Hi! I'm IGNO",
    problemTag: "The problem",
    problemH: "School teaches 30 kids the same. But no two kids learn the same.",
    problemSub: "Same explanations, same examples, same pace. The fast ones get bored. The slower ones get overwhelmed. And almost no one is spoken to in their own language.",
    problems: [
      { i: "😴", t: "They tune out", d: "When content doesn't connect with what matters to them, the brain discards it." },
      { i: "📉", t: "They lose confidence", d: "Falling behind in a group teaches more about comparison than about the topic." },
      { i: "🔁", t: "They forget fast", d: "Memorizing without context = information that evaporates in a week." },
    ],
    solTag: "The solution",
    solH: "A different class for each child, every day.",
    solSub: "IGNOTO is not a pre-recorded course. It's an AI tutor that builds the lesson on the spot, using your child's unique context.",
    features: [
      { c: "primary", i: "🎯", t: "Learns with what they love", d: "Planets, K-pop, soccer? That world becomes the stage where math, reading or science is taught. Motivation stops being a problem." },
      { c: "coral", i: "📊", t: "Adjusts to their real level", d: "Every answer tunes the next lesson. Mastered it? Goes up. Hesitated? IGNO retries with another analogy. No rigid groups or labels." },
      { c: "accent", i: "🦉", t: "A tutor who listens", d: "IGNO answers questions in kid-language, with visual examples and generated animations. They can ask anything, no shame." },
      { c: "mint", i: "🎮", t: "Learning doesn't feel like homework", d: "XP, streaks, an epic map, rewards. A videogame structure keeps attention where a PDF loses it." },
    ],
    persoH: "Same topic, told for each kid",
    persoSub1: "Here's what teaching ",
    persoSub2: " looks like in IGNOTO depending on the child's interests:",
    persoTopic: "fractions",
    cards: [
      { e: "🦖", n: "For Mateo, 7", g: "Loves dinosaurs", q: "If a T-Rex eats ¾ of a brontosaurus, how much is left for tomorrow?" },
      { e: "⚽", n: "For Sofía, 8", g: "Lives soccer", q: "The team scored 2 goals out of 5 shots. What fraction did they make?" },
      { e: "🎨", n: "For Lía, 6", g: "Paints all day", q: "If your palette has 8 colors and you've used 3, what fraction is left to try?" },
    ],
    howH: "How it works",
    steps: [
      { n: 1, t: "Tell us who they are", d: "Age, level, language, interests and favorite subjects. That info is the base of everything." },
      { n: 2, t: "IGNOTO builds their world", d: "Generates a unique plan, a lesson map and an IGNO tutor with the right voice for their age." },
      { n: 3, t: "Learns and adjusts itself", d: "Every answer teaches IGNOTO how your child thinks. The next lesson lands sharper." },
    ],
    princH: "What we believe",
    principles: [
      { i: "🌱", t: "Context teaches, not content", d: "A loose fact is forgotten. A fact inside something the child cares about stays." },
      { i: "🧭", t: "Each kid sets their pace", d: "Going faster or slower isn't good or bad. It's information to teach better." },
      { i: "🛡️", t: "No social pressure", d: "No public rankings, no comparisons. Just your child's progress, with their mascot." },
      { i: "👪", t: "Parents as allies", d: "You'll see what they learned, what was hard and what they loved. To support without invading." },
    ],
    ctaH: "A lesson made for your child, waiting",
    ctaSub: "Tell us who they are and let IGNOTO do the rest. No complicated passwords, no friction — just real learning, in their own language.",
    ctaBtn: "Create my profile →",
    footer: "Made with 💜 for curious kids",
  },
} as const;

function Landing() {
  const t = useT(T);
  return (
    <main className="min-h-screen">
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-5 pt-6 pb-16 md:pt-12 md:pb-28 grid md:grid-cols-2 gap-10 items-center">
          <div className="space-y-6 animate-pop-in">
            <span className="inline-block rounded-full bg-accent text-accent-foreground px-3 py-1 text-xs font-bold uppercase tracking-wider">{t.badge}</span>
            <h1 className="font-display text-5xl md:text-7xl font-bold leading-[0.95] text-balance">
              {t.h1a} <span className="text-primary">{t.h1b}</span>{t.h1c}
            </h1>
            <p className="text-lg text-muted-foreground max-w-md">{t.sub}</p>
            <div className="flex flex-wrap gap-3">
              <Link to="/registro" className="rounded-full bg-primary text-primary-foreground px-6 py-3.5 font-bold text-lg shadow-pop hover:translate-y-0.5 hover:shadow-none transition-all">
                {t.cta1}
              </Link>
              <a href="#por-que" className="rounded-full bg-card border-2 border-border px-6 py-3.5 font-bold text-lg hover:bg-muted transition-colors">
                {t.cta2}
              </a>
            </div>
            <div className="flex items-center gap-4 pt-4 text-xs text-muted-foreground">
              <div className="flex -space-x-2">
                {["🦊","🦄","🦖","🐼"].map((e) => <div key={e} className="w-9 h-9 rounded-full bg-card border-2 border-background flex items-center justify-center text-lg shadow-soft">{e}</div>)}
              </div>
              <span>{t.social}</span>
            </div>
          </div>
          <div className="relative flex justify-center items-center min-h-[360px]">
            <div className="absolute top-4 left-2 animate-float"><KawaiiBlob shape="pentagon" color="var(--sky)" size={88} mood="happy" /></div>
            <div className="absolute top-2 right-4 animate-float" style={{ animationDelay: "0.4s" }}><KawaiiBlob shape="circle" color="var(--coral)" size={96} mood="wink" /></div>
            <div className="absolute bottom-6 left-10 animate-float" style={{ animationDelay: "0.8s" }}><KawaiiBlob shape="triangle" color="var(--mint)" size={84} mood="sleepy" /></div>
            <div className="absolute bottom-2 right-6 animate-float" style={{ animationDelay: "1.2s" }}><KawaiiBlob shape="square" color="var(--accent)" size={92} mood="smile" /></div>
            <div className="relative animate-float">
              <KawaiiBlob shape="blob" color="var(--primary)" size={200} mood="star" />
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-card rounded-full px-4 py-2 shadow-pop border-2 border-border whitespace-nowrap text-sm font-bold">
                {t.hello}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PROBLEMA */}
      <section id="por-que" className="bg-muted/40 border-y border-border">
        <div className="max-w-6xl mx-auto px-5 py-16 md:py-20">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="inline-block rounded-full bg-coral/20 text-coral-foreground px-3 py-1 text-xs font-bold uppercase tracking-wider mb-3">{t.problemTag}</span>
            <h2 className="font-display text-3xl md:text-4xl font-bold leading-tight">{t.problemH}</h2>
            <p className="text-muted-foreground mt-3">{t.problemSub}</p>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {t.problems.map((x) => (
              <div key={x.t} className="rounded-2xl bg-card border border-border p-5">
                <div className="text-3xl mb-2">{x.i}</div>
                <h3 className="font-display font-bold text-lg mb-1">{x.t}</h3>
                <p className="text-sm text-muted-foreground">{x.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SOLUCIÓN */}
      <section className="max-w-6xl mx-auto px-5 py-20">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="inline-block rounded-full bg-mint/30 text-mint-foreground px-3 py-1 text-xs font-bold uppercase tracking-wider mb-3">{t.solTag}</span>
          <h2 className="font-display text-3xl md:text-5xl font-bold leading-tight">{t.solH}</h2>
          <p className="text-muted-foreground mt-3">{t.solSub}</p>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {t.features.map((f) => (
            <div key={f.t} className="rounded-3xl p-6 bg-card border border-border hover:shadow-soft transition-shadow">
              <div className={`w-14 h-14 rounded-2xl bg-${f.c} text-${f.c}-foreground flex items-center justify-center text-3xl mb-4 shadow-pop`}>{f.i}</div>
              <h3 className="font-display text-2xl font-bold mb-2">{f.t}</h3>
              <p className="text-muted-foreground">{f.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PERSONALIZACIÓN */}
      <section className="bg-card border-y border-border">
        <div className="max-w-6xl mx-auto px-5 py-16 md:py-20">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-center mb-3">{t.persoH}</h2>
          <p className="text-center text-muted-foreground max-w-xl mx-auto mb-10">{t.persoSub1}<strong>{t.persoTopic}</strong>{t.persoSub2}</p>
          <div className="grid md:grid-cols-3 gap-5">
            {t.cards.map((c) => (
              <div key={c.n} className="rounded-3xl bg-background border-2 border-border p-5 shadow-soft">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-xl">{c.e}</div>
                  <div>
                    <div className="font-bold text-sm">{c.n}</div>
                    <div className="text-xs text-muted-foreground">{c.g}</div>
                  </div>
                </div>
                <div className="rounded-2xl bg-primary/10 border border-primary/20 p-3 text-sm">{c.q}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CÓMO FUNCIONA */}
      <section id="como" className="max-w-6xl mx-auto px-5 py-20">
        <h2 className="font-display text-4xl md:text-5xl font-bold text-center mb-12">{t.howH}</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {t.steps.map((s) => (
            <div key={s.n} className="rounded-3xl bg-card border-2 border-border p-6 shadow-soft hover:-translate-y-1 transition-transform">
              <div className="h-full">
                <div className="w-12 h-12 rounded-full bg-accent text-accent-foreground font-display font-bold text-xl flex items-center justify-center shadow-pop mb-4">{s.n}</div>
                <h3 className="font-display text-2xl font-bold mb-2">{s.t}</h3>
                <p className="text-muted-foreground">{s.d}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* PRINCIPIOS */}
      <section className="bg-muted/40 border-y border-border">
        <div className="max-w-6xl mx-auto px-5 py-16 md:py-20">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-center mb-10">{t.princH}</h2>
          <div className="grid md:grid-cols-2 gap-4 max-w-4xl mx-auto">
            {t.principles.map((p) => (
              <div key={p.t} className="flex gap-4 rounded-2xl bg-card border border-border p-5">
                <div className="text-3xl flex-shrink-0">{p.i}</div>
                <div>
                  <h3 className="font-display font-bold text-lg mb-1">{p.t}</h3>
                  <p className="text-sm text-muted-foreground">{p.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-5 pb-20 pt-20">
        <div className="max-w-5xl mx-auto rounded-[2.5rem] bg-primary p-10 md:p-16 text-center shadow-soft text-primary-foreground relative overflow-hidden">
          <div className="absolute top-6 left-8 animate-float"><KawaiiBlob shape="circle" color="var(--accent)" size={64} mood="happy" /></div>
          <div className="absolute bottom-6 right-10 animate-float" style={{ animationDelay: "1s" }}><KawaiiBlob shape="drop" color="var(--coral)" size={64} mood="wink" /></div>
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">{t.ctaH}</h2>
          <p className="opacity-90 max-w-xl mx-auto mb-8">{t.ctaSub}</p>
          <Link to="/registro" className="inline-block rounded-full bg-accent text-accent-foreground px-8 py-4 font-bold text-lg shadow-pop hover:translate-y-0.5 hover:shadow-none transition-all">
            {t.ctaBtn}
          </Link>
        </div>
      </section>

      <footer className="text-center text-xs text-muted-foreground pb-8">
        © {new Date().getFullYear()} IGNOTO · {t.footer}
      </footer>
    </main>
  );
}
