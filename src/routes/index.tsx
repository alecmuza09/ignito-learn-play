import { createFileRoute, Link } from "@tanstack/react-router";
import { IgnoOwl } from "@/components/Igno";

export const Route = createFileRoute("/")({ component: Landing });

function Landing() {
  return (
    <main className="min-h-screen">
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-5 pt-10 pb-16 md:pt-20 md:pb-28 grid md:grid-cols-2 gap-10 items-center">
          <div className="space-y-6 animate-pop-in">
            <span className="inline-block rounded-full bg-accent text-accent-foreground px-3 py-1 text-xs font-bold uppercase tracking-wider">⚡ Aprendizaje con IA</span>
            <h1 className="font-display text-5xl md:text-7xl font-bold leading-[0.95] text-balance">
              Aprender es <span className="bg-gradient-hero bg-clip-text text-transparent">épico</span> con IGNOTO.
            </h1>
            <p className="text-lg text-muted-foreground max-w-md">
              Lecciones generadas por IA, niveladas a tu hijo, conectadas con sus intereses. Como un videojuego que enseña de verdad.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/registro" className="rounded-full bg-primary text-primary-foreground px-6 py-3.5 font-bold text-lg shadow-pop hover:translate-y-0.5 hover:shadow-none transition-all">
                Empezar la aventura →
              </Link>
              <a href="#como" className="rounded-full bg-card border-2 border-border px-6 py-3.5 font-bold text-lg hover:bg-muted transition-colors">
                Cómo funciona
              </a>
            </div>
            <div className="flex items-center gap-4 pt-4 text-xs text-muted-foreground">
              <div className="flex -space-x-2">
                {["🦊","🦄","🦖","🐼"].map((e) => <div key={e} className="w-9 h-9 rounded-full bg-card border-2 border-background flex items-center justify-center text-lg shadow-soft">{e}</div>)}
              </div>
              <span>+1,000 niños ya están aprendiendo así</span>
            </div>
          </div>
          <div className="relative flex justify-center">
            <div className="absolute -top-6 -right-4 w-24 h-24 rounded-full bg-accent animate-float" />
            <div className="absolute bottom-10 -left-6 w-16 h-16 rounded-3xl bg-coral animate-float" style={{ animationDelay: "1s" }} />
            <div className="absolute top-1/3 -right-10 w-12 h-12 rounded-full bg-mint animate-float" style={{ animationDelay: "0.5s" }} />
            <div className="relative bg-gradient-hero rounded-[2.5rem] p-10 shadow-soft">
              <IgnoOwl size={240} />
              <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 bg-card rounded-full px-4 py-2 shadow-pop border-2 border-border whitespace-nowrap text-sm font-bold">
                ¡Hola! Soy IGNO 🦉
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="bg-card border-y border-border">
        <div className="max-w-6xl mx-auto px-5 py-16 grid md:grid-cols-3 gap-6">
          {[
            { c: "primary", i: "🧠", t: "IA que se adapta", d: "Cada lección se genera midiendo lo que tu hijo ya sabe y lo que le apasiona." },
            { c: "coral", i: "🎮", t: "Sabe a videojuego", d: "XP, niveles, racha, monedas, insignias y un mapa épico para desbloquear." },
            { c: "mint", i: "🦉", t: "IGNO siempre ahí", d: "Un tutor búho que responde dudas en lenguaje de niño, con sus propios intereses." },
          ].map((f, i) => (
            <div key={i} className="rounded-3xl p-6 bg-background border border-border hover:shadow-soft transition-shadow">
              <div className={`w-14 h-14 rounded-2xl bg-${f.c} text-${f.c}-foreground flex items-center justify-center text-3xl mb-4 shadow-pop`}>{f.i}</div>
              <h3 className="font-display text-xl font-bold mb-1">{f.t}</h3>
              <p className="text-sm text-muted-foreground">{f.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW */}
      <section id="como" className="max-w-6xl mx-auto px-5 py-20">
        <h2 className="font-display text-4xl md:text-5xl font-bold text-center mb-12">Cómo funciona</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { n: 1, t: "Cuéntanos quién es", d: "Edad, nivel, intereses y materias favoritas en 5 pasitos ilustrados." },
            { n: 2, t: "Recibe su plan", d: "IGNOTO arma un plan semanal y un mapa de aprendizaje único." },
            { n: 3, t: "A jugar y aprender", d: "Cada lección es una historia con quizz, recompensas y celebración." },
          ].map((s) => (
            <div key={s.n} className="rounded-3xl bg-gradient-hero p-1 shadow-soft">
              <div className="rounded-[1.4rem] bg-card p-6 h-full">
                <div className="w-12 h-12 rounded-full bg-accent text-accent-foreground font-display font-bold text-xl flex items-center justify-center shadow-pop mb-4">{s.n}</div>
                <h3 className="font-display text-2xl font-bold mb-2">{s.t}</h3>
                <p className="text-muted-foreground">{s.d}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-5 pb-20">
        <div className="max-w-5xl mx-auto rounded-[2.5rem] bg-gradient-hero p-10 md:p-16 text-center shadow-soft text-primary-foreground relative overflow-hidden">
          <div className="absolute top-6 left-8 text-5xl animate-float">⭐</div>
          <div className="absolute bottom-6 right-10 text-5xl animate-float" style={{ animationDelay: "1s" }}>🚀</div>
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">Tu aventura empieza hoy</h2>
          <p className="opacity-90 max-w-xl mx-auto mb-8">Sin contraseñas para los más pequeños. Sin fricciones. Solo aprendizaje real, divertido y personalizado.</p>
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
