import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type KeyboardEvent } from "react";
import { AVATARS, clearProfile, updateProfile, useProfile, SUBJECTS, interestsForAge, type Subject, type Difficulty } from "@/lib/profile";
import { useT, useLang } from "@/lib/i18n";

const T = {
  es: {
    loading: "Cargando…",
    h1: "👤 Tu perfil",
    years: "años",
    changeAvatar: "Cambia tu avatar",
    stats: "Estadísticas",
    xp: "XP",
    coins: "Monedas",
    streak: "Racha",
    passions: "✨ Lo que me apasiona",
    passionsSub: "Esto guía las historias e imágenes de cada lección.",
    placeholder: "Spiderman, Roblox, dinosaurios…",
    remove: (c: string) => `Quitar ${c}`,
    subjects: "📚 Materias para seguir aprendiendo",
    subjectsSub: "Activa o ajusta dificultad cuando quieras.",
    difficulty: "Dificultad:",
    reset: "Reiniciar perfil",
    confirmReset: "¿Borrar tu perfil y empezar de nuevo?",
  },
  en: {
    loading: "Loading…",
    h1: "👤 Your profile",
    years: "years old",
    changeAvatar: "Change your avatar",
    stats: "Stats",
    xp: "XP",
    coins: "Coins",
    streak: "Streak",
    passions: "✨ What I love",
    passionsSub: "This guides the stories and images of each lesson.",
    placeholder: "Spiderman, Roblox, dinosaurs…",
    remove: (c: string) => `Remove ${c}`,
    subjects: "📚 Subjects to keep learning",
    subjectsSub: "Toggle or adjust difficulty anytime.",
    difficulty: "Difficulty:",
    reset: "Reset profile",
    confirmReset: "Delete your profile and start over?",
  },
} as const;

export const Route = createFileRoute("/perfil")({
  head: () => ({ meta: [{ title: "Perfil — IGNOTO" }] }),
  component: Perfil,
});

function Perfil() {
  const profile = useProfile();
  const nav = useNavigate();
  const t = useT(T);
  const { lang } = useLang();
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
    if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addCustom(); }
  }
  function toggleSubject(id: Subject) {
    const has = profile!.subjects.find((s) => s.id === id);
    const list = has ? profile!.subjects.filter((s) => s.id !== id) : [...profile!.subjects, { id, difficulty: 3 as Difficulty }];
    updateProfile({ subjects: list });
  }
  function setDiff(id: Subject, difficulty: Difficulty) {
    updateProfile({ subjects: profile!.subjects.map((s) => s.id === id ? { ...s, difficulty } : s) });
  }

  return (
    <main className="max-w-2xl mx-auto px-4 py-6 pb-24 space-y-6">
      <h1 className="font-display text-3xl font-bold">{t.h1}</h1>

      <section className="rounded-3xl bg-card border border-border p-5 shadow-soft">
        <div className="flex items-center gap-4">
          <div className="text-6xl">{profile.avatar}</div>
          <div>
            <div className="font-display text-xl font-bold">{profile.childName}</div>
            <div className="text-sm text-muted-foreground">{profile.age} {t.years}</div>
          </div>
        </div>
        <div className="mt-5">
          <div className="text-sm font-bold mb-2">{t.changeAvatar}</div>
          <div className="grid grid-cols-6 gap-2">
            {AVATARS.map((a) => (
              <button key={a} onClick={() => updateProfile({ avatar: a })}
                className={`aspect-square text-3xl rounded-2xl ${profile.avatar === a ? "bg-primary text-primary-foreground scale-110" : "bg-muted hover:bg-secondary"}`}>{a}</button>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-3xl bg-card border border-border p-5 shadow-soft">
        <h2 className="font-display text-xl font-bold mb-3">{t.stats}</h2>
        <div className="grid grid-cols-3 gap-3 text-center">
          <Stat label={t.xp} value={profile.xp} />
          <Stat label={t.coins} value={profile.coins} />
          <Stat label={t.streak} value={`${profile.streak}🔥`} />
        </div>
      </section>

      <section className="rounded-3xl bg-card border border-border p-5 shadow-soft">
        <h2 className="font-display text-xl font-bold mb-1">{t.passions}</h2>
        <p className="text-sm text-muted-foreground mb-4">{t.passionsSub}</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
          {presets.map((it) => {
            const sel = profile.interests.includes(it.id);
            return (
              <button key={it.id} onClick={() => toggleInterest(it.id)}
                className={`rounded-2xl p-3 text-center border-2 transition-all ${sel ? "border-accent bg-accent/15" : "border-border hover:bg-muted"}`}>
                <div className="text-2xl">{it.emoji}</div>
                <div className="text-[11px] font-bold mt-1">{it.label}</div>
              </button>
            );
          })}
        </div>
        <div className="flex gap-2">
          <input value={newInterest} onChange={(e) => setNewInterest(e.target.value)} onKeyDown={onKey}
            placeholder={t.placeholder} maxLength={40}
            className="flex-1 rounded-2xl bg-muted px-4 py-2.5 outline-none focus:ring-2 ring-primary text-sm" />
          <button onClick={addCustom} className="rounded-2xl bg-primary text-primary-foreground px-4 font-bold shadow-pop">+</button>
        </div>
        {customInterests.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {customInterests.map((c) => (
              <span key={c} className="inline-flex items-center gap-1.5 rounded-full bg-coral text-coral-foreground px-3 py-1 text-xs font-bold">
                {c}
                <button onClick={() => toggleInterest(c)} aria-label={t.remove(c)}>✕</button>
              </span>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-3xl bg-card border border-border p-5 shadow-soft">
        <h2 className="font-display text-xl font-bold mb-1">{t.subjects}</h2>
        <p className="text-sm text-muted-foreground mb-4">{t.subjectsSub}</p>
        <div className="space-y-2">
          {SUBJECTS.map((s) => {
            const sel = profile.subjects.find((x) => x.id === s.id);
            return (
              <div key={s.id} className={`rounded-2xl border-2 overflow-hidden ${sel ? "border-primary" : "border-border"}`}>
                <button onClick={() => toggleSubject(s.id)} className="w-full p-3 flex items-center gap-3 hover:bg-muted">
                  <span className="text-2xl">{s.emoji}</span>
                  <span className="font-bold flex-1 text-left text-sm">{s.label}</span>
                  <span className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs ${sel ? "bg-primary border-primary text-primary-foreground" : "border-muted-foreground"}`}>{sel ? "✓" : ""}</span>
                </button>
                {sel && (
                  <div className="px-3 pb-3 flex items-center gap-2 bg-primary/5">
                    <span className="text-[11px] font-bold text-muted-foreground">{t.difficulty}</span>
                    {(["😟","😐","😊","🔥"] as const).map((face, i) => {
                      const d = (i + 1) as Difficulty;
                      return (
                        <button key={d} onClick={() => setDiff(s.id, d)}
                          className={`text-xl p-1 rounded-lg transition-all ${sel.difficulty === d ? "bg-accent scale-125" : "opacity-50 hover:opacity-100"}`}>{face}</button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <button onClick={() => { if (confirm(t.confirmReset)) { clearProfile(); nav({ to: "/" }); } }}
        className="w-full rounded-full bg-destructive text-destructive-foreground py-3 font-bold">
        {t.reset}
      </button>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl bg-muted p-3">
      <div className="font-display text-2xl font-bold">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}
