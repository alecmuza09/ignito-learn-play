import { createFileRoute, Link } from "@tanstack/react-router";
import { KawaiiBlob } from "@/components/KawaiiBlob";

export const Route = createFileRoute("/")({ component: Landing });

function Landing() {
  return (
    <main className="min-h-screen">
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-5 pt-10 pb-16 md:pt-20 md:pb-28 grid md:grid-cols-2 gap-10 items-center">
          <div className="space-y-6 animate-pop-in">
            <span className="inline-block rounded-full bg-accent text-accent-foreground px-3 py-1 text-xs font-bold uppercase tracking-wider">⚡ Aprendizaje a la medida</span>
            <h1 className="font-display text-5xl md:text-7xl font-bold leading-[0.95] text-balance">
              Cada niño aprende <span className="text-primary">distinto</span>. Por fin una app que lo entiende.
            </h1>
            <p className="text-lg text-muted-foreground max-w-md">
              IGNOTO genera cada lección desde cero usando lo que tu hijo sabe, cómo aprende y lo que le apasiona. Si le gustan los dinosaurios, las fracciones se explican con dinosaurios. Si va más rápido, la dificultad sube. Si se atasca, IGNO lo acompaña con otra explicación.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/registro" className="rounded-full bg-primary text-primary-foreground px-6 py-3.5 font-bold text-lg shadow-pop hover:translate-y-0.5 hover:shadow-none transition-all">
                Empezar la aventura →
              </Link>
              <a href="#por-que" className="rounded-full bg-card border-2 border-border px-6 py-3.5 font-bold text-lg hover:bg-muted transition-colors">
                ¿Por qué importa?
              </a>
            </div>
            <div className="flex items-center gap-4 pt-4 text-xs text-muted-foreground">
              <div className="flex -space-x-2">
                {["🦊","🦄","🦖","🐼"].map((e) => <div key={e} className="w-9 h-9 rounded-full bg-card border-2 border-background flex items-center justify-center text-lg shadow-soft">{e}</div>)}
              </div>
              <span>+1,000 niños ya están aprendiendo así</span>
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
                ¡Hola! Soy IGNO
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PROBLEMA */}
      <section id="por-que" className="bg-muted/40 border-y border-border">
        <div className="max-w-6xl mx-auto px-5 py-16 md:py-20">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="inline-block rounded-full bg-coral/20 text-coral-foreground px-3 py-1 text-xs font-bold uppercase tracking-wider mb-3">El problema</span>
            <h2 className="font-display text-3xl md:text-4xl font-bold leading-tight">El colegio enseña a 30 niños igual. Pero ningún niño aprende igual.</h2>
            <p className="text-muted-foreground mt-3">Mismas explicaciones, mismos ejemplos, mismo ritmo. Al que va rápido le aburre. Al que va lento le abruma. Y a casi nadie le hablan en su propio lenguaje.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { i: "😴", t: "Se desconectan", d: "Cuando el contenido no conecta con lo que les importa, el cerebro lo descarta." },
              { i: "📉", t: "Pierden confianza", d: "Quedarse atrás en grupo enseña más sobre comparación que sobre el tema." },
              { i: "🔁", t: "Olvidan rápido", d: "Memorizar sin contexto = información que se evapora en una semana." },
            ].map((x) => (
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
          <span className="inline-block rounded-full bg-mint/30 text-mint-foreground px-3 py-1 text-xs font-bold uppercase tracking-wider mb-3">La solución</span>
          <h2 className="font-display text-3xl md:text-5xl font-bold leading-tight">Una clase distinta para cada niño, cada día.</h2>
          <p className="text-muted-foreground mt-3">IGNOTO no es un curso pregrabado. Es un tutor con IA que arma la lección en el momento, usando el contexto único de tu hijo.</p>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {[
            { c: "primary", i: "🎯", t: "Aprende con lo que ama", d: "¿Le gustan los planetas, K-pop o el fútbol? Ese mundo se vuelve el escenario donde se enseñan matemáticas, lectura o ciencias. La motivación deja de ser un problema." },
            { c: "coral", i: "📊", t: "Se ajusta a su nivel real", d: "Cada respuesta ajusta la siguiente lección. Si dominó algo, sube. Si dudó, IGNO repite con otra analogía. Sin grupos rígidos ni etiquetas." },
            { c: "accent", i: "🦉", t: "Un tutor que escucha", d: "IGNO responde dudas en lenguaje de niño, con ejemplos visuales y animaciones generadas. Pueden preguntar lo que quieran, sin pena." },
            { c: "mint", i: "🎮", t: "Aprender no se siente como tarea", d: "XP, racha, mapa épico, recompensas. La estructura de un videojuego sostiene la atención donde un PDF la pierde." },
          ].map((f) => (
            <div key={f.t} className="rounded-3xl p-6 bg-card border border-border hover:shadow-soft transition-shadow">
              <div className={`w-14 h-14 rounded-2xl bg-${f.c} text-${f.c}-foreground flex items-center justify-center text-3xl mb-4 shadow-pop`}>{f.i}</div>
              <h3 className="font-display text-2xl font-bold mb-2">{f.t}</h3>
              <p className="text-muted-foreground">{f.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PERSONALIZACIÓN EN ACCIÓN */}
      <section className="bg-card border-y border-border">
        <div className="max-w-6xl mx-auto px-5 py-16 md:py-20">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-center mb-3">El mismo tema, contado para cada niño</h2>
          <p className="text-center text-muted-foreground max-w-xl mx-auto mb-10">Así se ve enseñar <strong>fracciones</strong> en IGNOTO según los intereses del niño:</p>
          <div className="grid md:grid-cols-3 gap-5">
            {[
              { e: "🦖", n: "Para Mateo, 7", g: "Ama dinosaurios", q: "Si un T-Rex se come ¾ de un brontosaurio, ¿cuánto queda para mañana?" },
              { e: "⚽", n: "Para Sofía, 8", g: "Vive el fútbol", q: "El equipo metió 2 goles de los 5 tiros. ¿Qué fracción acertaron?" },
              { e: "🎨", n: "Para Lía, 6", g: "Pinta todo el día", q: "Si tu paleta tiene 8 colores y usas 3, ¿qué fracción te falta probar?" },
            ].map((c) => (
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
        <h2 className="font-display text-4xl md:text-5xl font-bold text-center mb-12">Cómo funciona</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { n: 1, t: "Cuéntanos quién es", d: "Edad, nivel, idioma, intereses y materias favoritas. Esa información es la base de todo." },
            { n: 2, t: "IGNOTO arma su mundo", d: "Genera un plan único, un mapa de lecciones y un tutor IGNO con la voz adecuada para su edad." },
            { n: 3, t: "Aprende y se ajusta solo", d: "Cada respuesta enseña a IGNOTO cómo piensa tu hijo. La siguiente lección llega más afinada." },
          ].map((s) => (
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
          <h2 className="font-display text-3xl md:text-4xl font-bold text-center mb-10">En lo que creemos</h2>
          <div className="grid md:grid-cols-2 gap-4 max-w-4xl mx-auto">
            {[
              { i: "🌱", t: "El contexto enseña, no el contenido", d: "Un dato suelto se olvida. Un dato dentro de algo que le importa al niño se queda." },
              { i: "🧭", t: "Cada niño marca su ritmo", d: "Avanzar más rápido o más lento no es bueno ni malo. Es información para enseñar mejor." },
              { i: "🛡️", t: "Sin presión social", d: "Aquí no hay rankings públicos ni comparaciones. Solo el progreso de tu hijo, con su mascota." },
              { i: "👪", t: "Padres como aliados", d: "Verás qué aprendió, qué le costó y qué le encantó. Para acompañar sin invadir." },
            ].map((p) => (
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
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">Una lección hecha para tu hijo, esperándolo</h2>
          <p className="opacity-90 max-w-xl mx-auto mb-8">Cuéntanos quién es y deja que IGNOTO haga el resto. Sin contraseñas complicadas, sin fricciones — solo aprendizaje real, en su propio idioma.</p>
          <Link to="/registro" className="inline-block rounded-full bg-accent text-accent-foreground px-8 py-4 font-bold text-lg shadow-pop hover:translate-y-0.5 hover:shadow-none transition-all">
            Crear mi perfil →
          </Link>
        </div>
      </section>

      <footer className="text-center text-xs text-muted-foreground pb-8">
        © {new Date().getFullYear()} IGNOTO · Hecho con 💜 para niños curiosos
      </footer>
    </main>
  );
}
