import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AVATARS, LEVELS, SUBJECTS, interestsForAge, saveProfile, type Difficulty, type Subject, type LearningLevel, type IgnotoProfile } from "@/lib/profile";
import { IgnoOwl } from "@/components/Igno";

export const Route = createFileRoute("/registro")({
  head: () => ({ meta: [{ title: "Registro — IGNOTO" }, { name: "description", content: "Crea el perfil de aprendizaje de tu hijo en 5 pasos." }] }),
  component: Registro,
});

const DIFF_FACES = ["😟", "😐", "😊", "🔥"] as const;

function Registro() {
  const nav = useNavigate();
  const [step, setStep] = useState(1);
  const [data, setData] = useState({
    role: "nino" as "nino" | "papa" | "tutor",
    avatar: "🦊",
    childName: "",
    age: 8,
    level: "primaria-1-3" as LearningLevel,
    language: "es" as "es" | "en" | "bi",
    interests: [] as string[],
    subjects: [] as { id: Subject; difficulty: Difficulty }[],
    style: { format: "video", focus: "15", mode: "solo" },
  });
  const interests = useMemo(() => interestsForAge(data.age), [data.age]);
  const totalSteps = 5;

  function next() { setStep((s) => Math.min(totalSteps, s + 1)); }
  function back() { setStep((s) => Math.max(1, s - 1)); }

  function toggleInterest(id: string) {
    setData((d) => {
      const has = d.interests.includes(id);
      const list = has ? d.interests.filter((x) => x !== id) : [...d.interests, id];
      if (list.length > 8) return d;
      return { ...d, interests: list };
    });
  }
  function toggleSubject(id: Subject) {
    setData((d) => {
      const has = d.subjects.find((s) => s.id === id);
      return { ...d, subjects: has ? d.subjects.filter((s) => s.id !== id) : [...d.subjects, { id, difficulty: 3 }] };
    });
  }
  function setSubjectDiff(id: Subject, difficulty: Difficulty) {
    setData((d) => ({ ...d, subjects: d.subjects.map((s) => s.id === id ? { ...s, difficulty } : s) }));
  }

  function canContinue() {
    if (step === 1) return data.childName.trim().length > 0;
    if (step === 2) return true;
    if (step === 3) return data.interests.length >= 3;
    if (step === 4) return data.subjects.length >= 1;
    return true;
  }

  function finish() {
    const profile: IgnotoProfile = {
      ownerRole: data.role, avatar: data.avatar, childName: data.childName.trim(), age: data.age,
      level: data.level, language: data.language, interests: data.interests, subjects: data.subjects,
      style: data.style, xp: 0, coins: 0, streak: 1, badges: ["primer-paso"], completedLessons: [],
      createdAt: new Date().toISOString(),
    };
    saveProfile(profile);
    nav({ to: "/dashboard" });
  }

  return (
    <main className="min-h-screen px-4 py-8 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <IgnoOwl size={48} />
        <div className="flex-1">
          <div className="text-xs text-muted-foreground font-bold">Paso {step} de {totalSteps}</div>
          <div className="h-2 mt-1 rounded-full bg-muted overflow-hidden">
            <div className="h-full bg-gradient-hero transition-all duration-500" style={{ width: `${(step / totalSteps) * 100}%` }} />
          </div>
        </div>
      </div>

      <div className="rounded-3xl bg-card border border-border p-6 md:p-8 shadow-soft animate-pop-in">
        {step === 1 && (
          <>
            <h2 className="font-display text-3xl font-bold mb-1">¿Quién se une?</h2>
            <p className="text-muted-foreground mb-5">Elige tu avatar y dinos cómo te llamas.</p>
            <div className="grid grid-cols-6 gap-2 mb-6">
              {AVATARS.map((a) => (
                <button key={a} onClick={() => setData((d) => ({ ...d, avatar: a }))}
                  className={`aspect-square text-3xl rounded-2xl flex items-center justify-center transition-all ${data.avatar === a ? "bg-primary text-primary-foreground scale-110 shadow-pop" : "bg-muted hover:bg-secondary"}`}>{a}</button>
              ))}
            </div>
            <label className="block text-sm font-bold mb-1.5">Nombre</label>
            <input value={data.childName} onChange={(e) => setData({ ...data, childName: e.target.value })}
              placeholder="¿Cómo te llaman?" className="w-full rounded-2xl bg-muted px-4 py-3 outline-none focus:ring-2 ring-primary mb-4" />
            <label className="block text-sm font-bold mb-2">Soy…</label>
            <div className="grid grid-cols-3 gap-2">
              {([{id:"nino",l:"Niño/a",e:"🧒"},{id:"papa",l:"Papá/Mamá",e:"👨‍👩‍👧"},{id:"tutor",l:"Tutor",e:"🧑‍🏫"}] as const).map((r) => (
                <button key={r.id} onClick={() => setData({ ...data, role: r.id })}
                  className={`rounded-2xl p-3 border-2 transition-all ${data.role === r.id ? "border-primary bg-primary/10" : "border-border hover:bg-muted"}`}>
                  <div className="text-2xl">{r.e}</div><div className="text-xs font-bold mt-1">{r.l}</div>
                </button>
              ))}
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <h2 className="font-display text-3xl font-bold mb-1">Sobre el alumno</h2>
            <p className="text-muted-foreground mb-5">Cuéntanos un poco más.</p>
            <label className="block text-sm font-bold mb-2">Edad: <span className="text-primary text-lg">{data.age} años</span></label>
            <input type="range" min={4} max={16} value={data.age} onChange={(e) => setData({ ...data, age: Number(e.target.value) })}
              className="w-full accent-primary mb-1" />
            <div className="flex justify-between text-xs text-muted-foreground mb-5"><span>4</span><span>16</span></div>

            <label className="block text-sm font-bold mb-2">Nivel escolar</label>
            <div className="grid grid-cols-2 gap-2 mb-5">
              {LEVELS.map((l) => (
                <button key={l.id} onClick={() => setData({ ...data, level: l.id })}
                  className={`rounded-2xl p-3 text-sm font-bold border-2 transition-all ${data.level === l.id ? "border-primary bg-primary text-primary-foreground" : "border-border hover:bg-muted"}`}>{l.label}</button>
              ))}
            </div>

            <label className="block text-sm font-bold mb-2">Idioma</label>
            <div className="grid grid-cols-3 gap-2">
              {([{id:"es",l:"Español",e:"🇲🇽"},{id:"en",l:"Inglés",e:"🇺🇸"},{id:"bi",l:"Bilingüe",e:"🌐"}] as const).map((o) => (
                <button key={o.id} onClick={() => setData({ ...data, language: o.id })}
                  className={`rounded-2xl p-3 border-2 transition-all ${data.language === o.id ? "border-primary bg-primary/10" : "border-border hover:bg-muted"}`}>
                  <div className="text-2xl">{o.e}</div><div className="text-xs font-bold mt-1">{o.l}</div>
                </button>
              ))}
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <h2 className="font-display text-3xl font-bold mb-1">¿Qué te apasiona?</h2>
            <p className="text-muted-foreground mb-5">Elige entre 3 y 8. ({data.interests.length} seleccionados)</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {interests.map((it) => {
                const sel = data.interests.includes(it.id);
                return (
                  <button key={it.id} onClick={() => toggleInterest(it.id)}
                    className={`rounded-2xl p-4 text-center border-2 transition-all ${sel ? "border-accent bg-accent/15 scale-105" : "border-border hover:bg-muted"}`}>
                    <div className="text-3xl">{it.emoji}</div>
                    <div className="text-xs font-bold mt-1.5">{it.label}</div>
                  </button>
                );
              })}
            </div>
          </>
        )}

        {step === 4 && (
          <>
            <h2 className="font-display text-3xl font-bold mb-1">Materias de interés</h2>
            <p className="text-muted-foreground mb-5">Selecciona y cuéntanos cómo te sientes.</p>
            <div className="space-y-2.5">
              {SUBJECTS.map((s) => {
                const sel = data.subjects.find((x) => x.id === s.id);
                return (
                  <div key={s.id} className={`rounded-2xl border-2 transition-all overflow-hidden ${sel ? "border-primary" : "border-border"}`}>
                    <button onClick={() => toggleSubject(s.id)} className="w-full p-3 flex items-center gap-3 hover:bg-muted">
                      <span className="text-2xl">{s.emoji}</span>
                      <span className="font-bold flex-1 text-left">{s.label}</span>
                      <span className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${sel ? "bg-primary border-primary text-primary-foreground" : "border-muted-foreground"}`}>{sel ? "✓" : ""}</span>
                    </button>
                    {sel && (
                      <div className="px-3 pb-3 flex items-center gap-2 bg-primary/5">
                        <span className="text-xs font-bold text-muted-foreground">¿Cómo te sientes?</span>
                        {DIFF_FACES.map((face, i) => {
                          const d = (i + 1) as Difficulty;
                          return (
                            <button key={d} onClick={() => setSubjectDiff(s.id, d)}
                              className={`text-2xl p-1 rounded-lg transition-all ${sel.difficulty === d ? "bg-accent scale-125" : "opacity-50 hover:opacity-100"}`}>{face}</button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}

        {step === 5 && (
          <>
            <h2 className="font-display text-3xl font-bold mb-1">Tu estilo</h2>
            <p className="text-muted-foreground mb-5">Solo 3 preguntitas rápidas.</p>
            <Quiz label="¿Cómo prefieres aprender?" value={data.style.format}
              options={[{v:"video",l:"Ver videos",e:"📺"},{v:"leer",l:"Leer",e:"📖"},{v:"hacer",l:"Practicar",e:"✏️"},{v:"jugar",l:"Jugar",e:"🎮"}]}
              onChange={(v) => setData({ ...data, style: { ...data.style, format: v } })} />
            <Quiz label="¿Cuánto te concentras?" value={data.style.focus}
              options={[{v:"5",l:"5 min",e:"⚡"},{v:"15",l:"15 min",e:"⏱️"},{v:"30",l:"30 min+",e:"🎯"}]}
              onChange={(v) => setData({ ...data, style: { ...data.style, focus: v } })} />
            <Quiz label="¿Solo o en reto?" value={data.style.mode}
              options={[{v:"solo",l:"Solo",e:"🧘"},{v:"reto",l:"Con reto",e:"⚔️"}]}
              onChange={(v) => setData({ ...data, style: { ...data.style, mode: v } })} />
          </>
        )}
      </div>

      <div className="flex gap-3 mt-5">
        {step > 1 && (
          <button onClick={back} className="rounded-full bg-card border-2 border-border px-5 py-3 font-bold hover:bg-muted">← Atrás</button>
        )}
        <button
          disabled={!canContinue()}
          onClick={step === totalSteps ? finish : next}
          className="flex-1 rounded-full bg-primary text-primary-foreground px-5 py-3 font-bold shadow-pop hover:translate-y-0.5 hover:shadow-none transition-all disabled:opacity-40 disabled:cursor-not-allowed">
          {step === totalSteps ? "¡Crear mi aventura! 🚀" : "Continuar →"}
        </button>
      </div>
    </main>
  );
}

function Quiz({ label, options, value, onChange }: { label: string; value: string; options: { v: string; l: string; e: string }[]; onChange: (v: string) => void }) {
  return (
    <div className="mb-5">
      <label className="block text-sm font-bold mb-2">{label}</label>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {options.map((o) => (
          <button key={o.v} onClick={() => onChange(o.v)}
            className={`rounded-2xl p-3 border-2 transition-all ${value === o.v ? "border-primary bg-primary/10" : "border-border hover:bg-muted"}`}>
            <div className="text-2xl">{o.e}</div><div className="text-xs font-bold mt-1">{o.l}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
