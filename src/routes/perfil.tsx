import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useRequireLearner } from "@/lib/use-guard";
import { useState, type KeyboardEvent } from "react";
import { deleteLearner, updateProfile, SUBJECTS, interestsForAge, type Subject, type Difficulty } from "@/lib/profile";
import { Companion } from "@/components/companion/Companion";
import { CHARACTER_LIST } from "@/components/companion/characters";
import { useT } from "@/lib/i18n";
import { Check, Trash2, X } from "lucide-react";
import { SubjectIcon } from "@/components/SubjectIcon";

const T = {
  es: {
    loading: "Cargando…",
    h1: "Perfil",
    years: "años",
    about: "Datos",
    name: "Nombre",
    age: "Edad",
    saved: "Los cambios se guardan solos.",
    add: "Agregar",
    levels: ["Me cuesta", "Más o menos", "Me va bien", "Lo domino"],
    stats: "Estadísticas",
    xp: "XP",
    coins: "Monedas",
    streak: "Racha",
    passions: "Lo que me gusta",
    passionsSub: "Esto guía las historias e imágenes de cada lección.",
    placeholder: "Spiderman, Roblox, dinosaurios…",
    remove: (c: string) => `Quitar ${c}`,
    subjects: "Materias",
    subjectsSub: "Actívalas o ajusta tu nivel cuando quieras.",
    difficulty: "¿Cómo te va?",
    reset: "Borrar este perfil",
    confirmReset: "¿Borrar este perfil y todo su progreso? Esto no se puede deshacer.",
    companion: "Tu compañero",
    voice: "Voz del compañero",
    voiceSub: "Tu compañero lee sus respuestas en voz alta.",
  },
  en: {
    loading: "Loading…",
    h1: "Profile",
    years: "years old",
    about: "Details",
    name: "Name",
    age: "Age",
    saved: "Changes save automatically.",
    add: "Add",
    levels: ["Hard for me", "So-so", "Going well", "Mastered"],
    stats: "Stats",
    xp: "XP",
    coins: "Coins",
    streak: "Streak",
    passions: "What I love",
    passionsSub: "This guides the stories and images of each lesson.",
    placeholder: "Spiderman, Roblox, dinosaurs…",
    remove: (c: string) => `Remove ${c}`,
    subjects: "Subjects",
    subjectsSub: "Turn them on or adjust your level anytime.",
    difficulty: "How is it going?",
    reset: "Delete this profile",
    confirmReset: "Delete this profile and all its progress? This can't be undone.",
    companion: "Your companion",
    voice: "Companion voice",
    voiceSub: "Your companion reads its answers out loud.",
  },
} as const;

export const Route = createFileRoute("/perfil")({
  head: () => ({ meta: [{ title: "Perfil · IGNOTO" }] }),
  component: Perfil,
});

function Perfil() {
  const profile = useRequireLearner();
  const nav = useNavigate();
  const t = useT(T);
  const [newInterest, setNewInterest] = useState("");
  if (!profile) return <div className="min-h-[60vh] grid place-items-center text-muted-foreground">{t.loading}</div>;
  const presets = interestsForAge(profile.age);
  const presetIds = new Set(presets.map((p) => p.id));
  const customInterests = profile.interests.filter((i) => !presetIds.has(i));

  function toggleInterest(id: string) {
    const has = profile!.interests.includes(id);
    const list = has ? profile!.interests.filter((x) => x !== id) : [...profile!.interests, id];
    updateProfile({ interests: list });
  }
  function addCustom() {
    const v = newInterest.trim();
    if (!v || profile!.interests.includes(v)) { setNewInterest(""); return; }
    updateProfile({ interests: [...profile!.interests, v] });
    setNewInterest("");
  }
  function onKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") { e.preventDefault(); addCustom(); }
  }
  function toggleSubject(id: Subject) {
    const has = profile!.subjects.find((s) => s.id === id);
    const list = has ? profile!.subjects.filter((s) => s.id !== id) : [...profile!.subjects, { id, difficulty: 3 as Difficulty }];
    updateProfile({ subjects: list });
  }
  function setDiff(id: Subject, difficulty: Difficulty) {
    updateProfile({ subjects: profile!.subjects.map((s) => s.id === id ? { ...s, difficulty } : s) });
  }

  const card = "rounded-3xl bg-card sticker p-5 md:p-6";
  return (
    <main className="paper-grid min-h-[calc(100vh-4rem)]">
      <div className="max-w-2xl mx-auto px-4 py-8 pb-24 space-y-6">
        <div className="flex items-end justify-between gap-3">
          <h1 className="font-display text-4xl md:text-5xl">{t.h1}</h1>
          <span className="hint">{t.saved}</span>
        </div>

        <section className={card}>
          <div className="flex items-center gap-4">
            <Companion id={profile.companion} size={88} state="happy" />
            <div className="min-w-0">
              <div className="font-display text-3xl truncate">{profile.childName}</div>
              <div className="text-sm text-muted-foreground">{profile.age} {t.years}</div>
            </div>
          </div>
          <div className="mt-5 grid grid-cols-[1fr_7rem] gap-3">
            <div>
              <label className="label" htmlFor="pf-name">{t.name}</label>
              <input id="pf-name" className="field" defaultValue={profile.childName} maxLength={30}
                onBlur={(e) => { const v = e.target.value.trim(); if (v && v !== profile.childName) updateProfile({ childName: v }); else e.target.value = profile.childName; }} />
            </div>
            <div>
              <label className="label" htmlFor="pf-age">{t.age}</label>
              <input id="pf-age" type="number" inputMode="numeric" className="field text-center tabular-nums" defaultValue={profile.age}
                min={profile.kind === "adult" ? 16 : 4} max={99}
                onBlur={(e) => { const n = Math.round(Number(e.target.value)); const min = profile.kind === "adult" ? 16 : 4; if (n >= min && n <= 99) updateProfile({ age: n }); else e.target.value = String(profile.age); }} />
            </div>
          </div>
        </section>

        <section className={card}>
          <h2 className="font-display text-2xl mb-3">{t.companion}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2" role="radiogroup">
            {CHARACTER_LIST.map((c) => {
              const sel = profile.companion === c.id;
              return (
                <button key={c.id} role="radio" aria-checked={sel} onClick={() => updateProfile({ companion: c.id })}
                  className={`rounded-2xl border-2 border-ink p-2 transition ${sel ? "bg-lime shadow-[3px_3px_0_var(--ink)]" : "bg-card hover:bg-white"}`}>
                  <div className="flex justify-center"><Companion id={c.id} size={76} state={sel ? "happy" : "idle"} interactive={false} /></div>
                  <div className="font-display text-lg">{c.name}</div>
                </button>
              );
            })}
          </div>
          <label className="mt-4 flex items-center justify-between gap-3 rounded-2xl border-2 border-ink bg-background px-4 py-3 cursor-pointer">
            <span>
              <span className="block font-bold text-sm">{t.voice}</span>
              <span className="block text-xs text-muted-foreground">{t.voiceSub}</span>
            </span>
            <input type="checkbox" className="h-5 w-5 accent-[var(--primary)]" checked={profile.voiceEnabled}
              onChange={(e) => updateProfile({ voiceEnabled: e.target.checked })} />
          </label>
        </section>

        <section className={card}>
          <h2 className="font-display text-2xl mb-3">{t.stats}</h2>
          <div className="grid grid-cols-3 gap-3 text-center">
            <Stat label={t.xp} value={profile.xp} />
            <Stat label={t.coins} value={profile.coins} />
            <Stat label={t.streak} value={profile.streak} />
          </div>
        </section>

        <section className={card}>
          <h2 className="font-display text-2xl">{t.passions}</h2>
          <p className="hint mt-1 mb-4">{t.passionsSub}</p>
          <div className="flex flex-wrap gap-2">
            {presets.map((it) => {
              const sel = profile.interests.includes(it.id);
              return (
                <button key={it.id} aria-pressed={sel} onClick={() => toggleInterest(it.id)} className="chip">
                  {sel && <Check className="h-4 w-4" />}{it.label}
                </button>
              );
            })}
            {customInterests.map((c) => (
              <button key={c} aria-pressed onClick={() => toggleInterest(c)} className="chip" aria-label={t.remove(c)}>
                {c} <X className="h-4 w-4" />
              </button>
            ))}
          </div>
          <div className="flex gap-2 mt-4">
            <input value={newInterest} onChange={(e) => setNewInterest(e.target.value)} onKeyDown={onKey}
              placeholder={t.placeholder} maxLength={40} className="field" />
            <button onClick={addCustom} disabled={!newInterest.trim()} className="btn-sticker bg-card px-4">{t.add}</button>
          </div>
        </section>

        <section className={card}>
          <h2 className="font-display text-2xl">{t.subjects}</h2>
          <p className="hint mt-1 mb-4">{t.subjectsSub}</p>
          <div className="space-y-2">
            {SUBJECTS.map((s) => {
              const sel = profile.subjects.find((x) => x.id === s.id);
              return (
                <div key={s.id} className={`rounded-2xl border-2 border-ink overflow-hidden ${sel ? "bg-lime/40" : "bg-card"}`}>
                  <button aria-pressed={!!sel} onClick={() => toggleSubject(s.id)} className="w-full p-2.5 flex items-center gap-3 text-left">
                    <SubjectIcon id={s.id} size={36} />
                    <span className="font-semibold flex-1">{s.label}</span>
                    <span className={`grid h-6 w-6 place-items-center rounded-md border-2 border-ink ${sel ? "bg-ink text-white" : "bg-card"}`}>
                      {sel && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
                    </span>
                  </button>
                  {sel && (
                    <div className="px-3 pb-3 flex flex-wrap items-center gap-1.5" role="radiogroup" aria-label={t.difficulty}>
                      <span className="text-xs font-semibold text-muted-foreground mr-1">{t.difficulty}</span>
                      {t.levels.map((l, i) => {
                        const d = (i + 1) as Difficulty;
                        return (
                          <button key={d} role="radio" aria-checked={sel.difficulty === d} onClick={() => setDiff(s.id, d)}
                            className="chip !min-h-8 !px-3 text-xs">{l}</button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        <button onClick={async () => { if (profile.id && confirm(t.confirmReset)) { await deleteLearner(profile.id); nav({ to: "/familia" }); } }}
          className="btn-sticker w-full bg-card text-destructive h-12">
          <Trash2 className="h-4 w-4" /> {t.reset}
        </button>
      </div>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border-2 border-ink bg-background p-3">
      <div className="font-display text-3xl tabular-nums">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}
