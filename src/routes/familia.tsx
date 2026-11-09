import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import {
  activateLearner,
  createLearner,
  deleteLearner,
  dismissLegacyProfile,
  levelTitle,
  listLearners,
  loadLegacyProfile,
  type IgnotoProfile,
} from "@/lib/profile";
import { useRequireAuth } from "@/lib/use-guard";
import { useT } from "@/lib/i18n";
import { Companion } from "@/components/companion/Companion";
import type { CompanionId } from "@/lib/profile";

type Learner = Awaited<ReturnType<typeof listLearners>>[number];

const T = {
  es: {
    title: "¿Quién aprende hoy?",
    hi: (n: string) => `Hola, ${n}`,
    sub: "Elige un perfil para entrar. Cada uno tiene su compañero, su progreso y su propio estilo.",
    addChild: "Agregar niño/a",
    addAdult: "Agregar adulto",
    kid: "Niño/a",
    adult: "Adulto",
    lessons: "lecciones",
    streak: "racha",
    empty: "Todavía no hay perfiles. Crea el primero para empezar.",
    legacy: (n: string) =>
      `Encontramos el perfil de ${n} guardado en este dispositivo. ¿Lo agregamos a tu familia con todo su progreso?`,
    import: "Agregar a mi familia",
    dismiss: "Descartar",
    remove: (n: string) => `¿Borrar el perfil de ${n} y todo su progreso?`,
    report: "Ver reporte",
    loading: "Cargando tu familia…",
  },
  en: {
    title: "Who's learning today?",
    hi: (n: string) => `Hi, ${n}`,
    sub: "Pick a profile to enter. Each one has its own companion, progress and style.",
    addChild: "Add child",
    addAdult: "Add adult",
    kid: "Child",
    adult: "Adult",
    lessons: "lessons",
    streak: "streak",
    empty: "No profiles yet. Create the first one to get started.",
    legacy: (n: string) =>
      `We found ${n}'s profile saved on this device. Add it to your family with all its progress?`,
    import: "Add to my family",
    dismiss: "Dismiss",
    remove: (n: string) => `Delete ${n}'s profile and all progress?`,
    report: "View report",
    loading: "Loading your family…",
  },
} as const;

export const Route = createFileRoute("/familia")({
  head: () => ({ meta: [{ title: "Familia · IGNOTO" }] }),
  component: Familia,
});

function Familia() {
  const t = useT(T);
  const auth = useRequireAuth();
  const nav = useNavigate();
  const [learners, setLearners] = useState<Learner[] | null>(null);
  const [legacy, setLegacy] = useState<IgnotoProfile | null>(null);
  const [entering, setEntering] = useState<string | null>(null);

  const userId = auth.user?.id;
  useEffect(() => {
    if (!userId) return;
    listLearners()
      .then((rows) => setLearners(rows.filter((r) => r.owner_id === userId)))
      .catch(() => setLearners([]));
    setLegacy(loadLegacyProfile());
  }, [userId]);

  async function enter(l: Learner) {
    setEntering(l.id);
    await activateLearner(l);
    // Let the companion finish its little celebration before navigating.
    setTimeout(() => nav({ to: "/dashboard" }), 650);
  }

  async function importLegacy() {
    if (!legacy) return;
    const row = await createLearner({ ...legacy, kind: legacy.kind ?? "child" });
    dismissLegacyProfile();
    setLegacy(null);
    setLearners((cur) => [...(cur ?? []), row]);
  }

  async function remove(l: Learner) {
    if (!confirm(t.remove(l.name))) return;
    await deleteLearner(l.id);
    setLearners((cur) => (cur ?? []).filter((x) => x.id !== l.id));
  }

  if (!auth.session || learners === null) {
    return (
      <div className="min-h-[60vh] grid place-items-center text-muted-foreground">{t.loading}</div>
    );
  }

  return (
    <main className="paper-grid min-h-[calc(100vh-4rem)]"><div className="max-w-5xl mx-auto px-4 py-10 pb-24">
      <header className="text-center mb-8">
        <p className="text-sm font-bold text-muted-foreground">
          {t.hi(auth.account?.display_name || auth.user?.email || "")}
        </p>
        <h1 className="font-display text-4xl md:text-6xl mt-1">
          {t.title}
        </h1>
        <p className="text-muted-foreground mt-2 max-w-xl mx-auto">{t.sub}</p>
      </header>

      {legacy && (
        <div className="mb-6 rounded-3xl sticker bg-lime p-4 flex flex-col sm:flex-row items-center gap-3">
          <Companion id={legacy.companion} size={48} interactive={false} />
          <p className="flex-1 text-sm">{t.legacy(legacy.childName)}</p>
          <div className="flex gap-2">
            <button
              onClick={importLegacy}
              className="btn-sticker bg-primary text-primary-foreground px-4 py-2 text-sm"
            >
              {t.import}
            </button>
            <button
              onClick={() => {
                dismissLegacyProfile();
                setLegacy(null);
              }}
              className="btn-sticker bg-card px-4 py-2 text-sm"
            >
              {t.dismiss}
            </button>
          </div>
        </div>
      )}

      {learners.length === 0 && <p className="text-center text-muted-foreground mb-6">{t.empty}</p>}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {learners.map((l, i) => {
          const lvl = levelTitle(l.xp);
          const isEntering = entering === l.id;
          return (
            <div
              key={l.id}
              className="group relative rounded-3xl bg-card sticker p-4 text-center transition-transform hover:-translate-y-1 hover:rotate-[-1deg] animate-pop-in"
              style={{ animationDelay: `${i * 60}ms`, animationFillMode: "backwards" }}
            >
              <button
                onClick={() => enter(l)}
                disabled={!!entering}
                className="w-full focus-visible:outline-none"
                aria-label={l.name}
              >
                <div className="flex justify-center">
                  <Companion
                    id={l.companion as CompanionId}
                    size={120}
                    state={isEntering ? "celebrate" : "idle"}
                    interactive={false}
                  />
                </div>
                <div className="font-display text-2xl mt-1 truncate">{l.name}</div>
                <div className="mt-1 text-xs font-bold text-muted-foreground">
                  {l.kind === "adult" ? t.adult : `${t.kid} · ${l.age}`} · {lvl.name}
                </div>
                <dl className="mt-3 grid grid-cols-3 gap-1 text-xs">
                  {[
                    { k: "XP", v: l.xp },
                    { k: t.lessons, v: l.completed_lessons.length },
                    { k: t.streak, v: l.streak },
                  ].map((x) => (
                    <div key={x.k} className="rounded-lg border-2 border-ink bg-background py-1">
                      <dd className="font-bold tabular-nums text-sm">{x.v}</dd>
                      <dt className="text-muted-foreground">{x.k}</dt>
                    </div>
                  ))}
                </dl>
              </button>
              <button
                onClick={() => remove(l)}
                className="absolute top-2 right-2 rounded-full p-1.5 text-muted-foreground sm:opacity-0 group-hover:opacity-100 focus:opacity-100 hover:bg-destructive/10 hover:text-destructive transition-opacity"
                aria-label={t.remove(l.name)}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          );
        })}

        <Link
          to="/registro"
          search={{ tipo: "child" }}
          className="rounded-3xl border-[2.5px] border-dashed border-ink p-4 grid place-items-center text-center hover:bg-lime transition-colors min-h-[220px]"
        >
          <div>
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-full border-2 border-ink bg-primary text-primary-foreground">
              <Plus />
            </div>
            <div className="mt-2 font-bold">{t.addChild}</div>
          </div>
        </Link>
        <Link
          to="/registro"
          search={{ tipo: "adult" }}
          className="rounded-3xl border-[2.5px] border-dashed border-ink p-4 grid place-items-center text-center hover:bg-lime transition-colors min-h-[220px]"
        >
          <div>
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-full border-2 border-ink bg-sky">
              <Plus />
            </div>
            <div className="mt-2 font-bold">{t.addAdult}</div>
          </div>
        </Link>
      </div>
    </div></main>
  );
}
