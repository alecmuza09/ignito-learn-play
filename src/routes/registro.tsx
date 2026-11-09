import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { ArrowLeft, ArrowRight, Check, Minus, Plus, X } from "lucide-react";
import {
  LEVELS,
  SUBJECTS,
  activateLearner,
  createLearner,
  interestsForAge,
  type CompanionId,
  type Difficulty,
  type LearningLevel,
  type Subject,
} from "@/lib/profile";
import { useRequireAuth } from "@/lib/use-guard";
import { Companion, type CompanionState } from "@/components/companion/Companion";
import { CHARACTER_LIST, CHARACTERS } from "@/components/companion/characters";
import { SubjectIcon } from "@/components/SubjectIcon";

export const Route = createFileRoute("/registro")({
  head: () => ({
    meta: [
      { title: "Nuevo perfil · IGNOTO" },
      { name: "description", content: "Crea un perfil de aprendizaje en tres pasos." },
    ],
  }),
  validateSearch: (s: Record<string, unknown>): { tipo?: "child" | "adult" } =>
    s.tipo === "adult" || s.tipo === "child" ? { tipo: s.tipo } : {},
  component: Registro,
});

const DRAFT_KEY = "ignoto.registro.draft.v2";
const MAX_INTERESTS = 3;
const NAME_MAX = 30;

const CONFIDENCE: { v: Difficulty; l: string }[] = [
  { v: 1, l: "Me cuesta" },
  { v: 2, l: "Más o menos" },
  { v: 3, l: "Me va bien" },
  { v: 4, l: "Lo domino" },
];

const SESSION: { v: string; l: string; d: string }[] = [
  { v: "5", l: "5 min", d: "Un reto rápido" },
  { v: "15", l: "15 min", d: "Lo recomendado" },
  { v: "30", l: "30 min", d: "Para ir a fondo" },
];

/** School level that usually matches an age in Mexico. */
function levelForAge(age: number): LearningLevel {
  if (age <= 5) return "preescolar";
  if (age <= 8) return "primaria-1-3";
  if (age <= 11) return "primaria-4-6";
  if (age <= 14) return "secundaria";
  if (age <= 17) return "preparatoria";
  return "adulto";
}

type Draft = {
  childName: string;
  age: number;
  level: LearningLevel;
  levelTouched: boolean;
  language: "es" | "en" | "bi";
  interests: string[];
  subjects: { id: Subject; difficulty: Difficulty }[];
  companion: CompanionId;
  focus: string;
};

function initialDraft(isAdult: boolean): Draft {
  return {
    childName: "",
    age: isAdult ? 30 : 8,
    level: isAdult ? "adulto" : "primaria-1-3",
    levelTouched: false,
    language: "es",
    interests: [],
    subjects: [],
    companion: isAdult ? "bolt" : "igno",
    focus: "15",
  };
}

function loadDraft(isAdult: boolean): Draft {
  if (typeof window === "undefined") return initialDraft(isAdult);
  try {
    const raw = sessionStorage.getItem(`${DRAFT_KEY}.${isAdult ? "adult" : "child"}`);
    if (raw) return { ...initialDraft(isAdult), ...(JSON.parse(raw) as Partial<Draft>) };
  } catch {
    /* ignore corrupt drafts */
  }
  return initialDraft(isAdult);
}

const STEPS = ["Datos", "Gustos y materias", "Compañero"] as const;

function Registro() {
  const nav = useNavigate();
  useRequireAuth();
  const { tipo } = Route.useSearch();
  const isAdult = tipo === "adult";
  const minAge = isAdult ? 16 : 4;
  const maxAge = isAdult ? 99 : 17;

  const [step, setStep] = useState(0);
  const [d, setD] = useState<Draft>(() => initialDraft(isAdult));
  const [ready, setReady] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [customInput, setCustomInput] = useState("");
  const nameRef = useRef<HTMLInputElement>(null);
  const draftKey = `${DRAFT_KEY}.${isAdult ? "adult" : "child"}`;

  // Restore a draft after hydration so a refresh doesn't lose what was typed.
  useEffect(() => {
    setD(loadDraft(isAdult));
    setReady(true);
  }, [isAdult]);
  useEffect(() => {
    if (!ready) return;
    try {
      sessionStorage.setItem(draftKey, JSON.stringify(d));
    } catch {
      /* storage may be unavailable */
    }
  }, [d, ready, draftKey]);
  useEffect(() => {
    if (step === 0) nameRef.current?.focus();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

  const update = (patch: Partial<Draft>) => setD((prev) => ({ ...prev, ...patch }));
  const setAge = (age: number) => {
    const a = Math.max(minAge, Math.min(maxAge, Math.round(age) || minAge));
    setD((prev) => ({ ...prev, age: a, level: prev.levelTouched ? prev.level : levelForAge(a) }));
  };

  const presets = useMemo(() => interestsForAge(d.age), [d.age]);
  const presetIds = new Set(presets.map((i) => i.id));
  const customInterests = d.interests.filter((i) => !presetIds.has(i));
  const interestsFull = d.interests.length >= MAX_INTERESTS;

  function toggleInterest(id: string) {
    setD((prev) => {
      if (prev.interests.includes(id)) return { ...prev, interests: prev.interests.filter((x) => x !== id) };
      if (prev.interests.length >= MAX_INTERESTS) return prev;
      return { ...prev, interests: [...prev.interests, id] };
    });
  }
  function addCustomInterest() {
    const v = customInput.trim().replace(/\s+/g, " ").slice(0, 40);
    if (!v) return;
    const exists = d.interests.some((x) => x.toLowerCase() === v.toLowerCase());
    if (!exists && !interestsFull) update({ interests: [...d.interests, v] });
    setCustomInput("");
  }
  function toggleSubject(id: Subject) {
    setD((prev) => {
      const has = prev.subjects.some((s) => s.id === id);
      return {
        ...prev,
        subjects: has
          ? prev.subjects.filter((s) => s.id !== id)
          : [...prev.subjects, { id, difficulty: 2 as Difficulty }],
      };
    });
  }
  const setConfidence = (id: Subject, difficulty: Difficulty) =>
    update({ subjects: d.subjects.map((s) => (s.id === id ? { ...s, difficulty } : s)) });

  const name = d.childName.trim();
  const errors: Record<number, string[]> = {
    0: [
      !name ? "Escribe un nombre." : "",
      name.length > NAME_MAX ? `Máximo ${NAME_MAX} caracteres.` : "",
    ].filter(Boolean),
    1: [
      d.interests.length === 0 ? "Elige al menos un tema que le guste." : "",
      d.subjects.length === 0 ? "Elige al menos una materia." : "",
    ].filter(Boolean),
    2: [],
  };
  const stepErrors = errors[step];

  function goNext(e?: FormEvent) {
    e?.preventDefault();
    if (stepErrors.length) {
      setShowErrors(true);
      return;
    }
    setShowErrors(false);
    if (step < STEPS.length - 1) setStep(step + 1);
    else void finish();
  }

  async function finish() {
    if (saving) return;
    setSaving(true);
    setSaveError(null);
    try {
      const row = await createLearner({
        kind: isAdult ? "adult" : "child",
        ownerRole: isAdult ? "tutor" : "nino",
        avatar: d.companion,
        childName: name,
        age: d.age,
        level: d.level,
        language: d.language,
        interests: d.interests,
        subjects: d.subjects,
        style: { format: "hacer", focus: d.focus, mode: "solo" },
        companion: d.companion,
        voiceEnabled: true,
        xp: 0,
        coins: 0,
        streak: 1,
        badges: ["primer-paso"],
        completedLessons: [],
      });
      await activateLearner(row);
      try {
        sessionStorage.removeItem(draftKey);
      } catch {
        /* ignore */
      }
      nav({ to: "/dashboard" });
    } catch (err) {
      setSaveError(
        err instanceof Error && err.message
          ? `No pudimos guardar el perfil: ${err.message}`
          : "No pudimos guardar el perfil. Revisa tu conexión e inténtalo de nuevo.",
      );
      setSaving(false);
    }
  }

  const levels = LEVELS.filter((l) => (isAdult ? l.id === "adulto" || l.id === "preparatoria" : l.id !== "adulto"));
  const mascotState: CompanionState = saving
    ? "celebrate"
    : showErrors && stepErrors.length
      ? "sad"
      : step === 2
        ? "happy"
        : "idle";
  const who = isAdult ? "tú" : name || "el alumno";

  return (
    <main className="paper-grid min-h-[calc(100vh-4rem)] px-4 py-8 md:py-12">
      <div className="max-w-2xl mx-auto">
        <Link to="/familia" className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Volver a perfiles
        </Link>

        {/* Progreso */}
        <ol className="mt-5 grid grid-cols-3 gap-2" aria-label="Progreso">
          {STEPS.map((label, i) => (
            <li key={label}>
              <button
                type="button"
                onClick={() => i < step && setStep(i)}
                disabled={i > step}
                className="w-full text-left disabled:cursor-default"
                aria-current={i === step ? "step" : undefined}
              >
                <span
                  className={`block h-2.5 rounded-full border-2 border-ink ${i <= step ? "bg-primary" : "bg-card"}`}
                />
                <span className={`mt-1.5 block text-xs font-semibold ${i === step ? "text-foreground" : "text-muted-foreground"}`}>
                  {i + 1}. {label}
                </span>
              </button>
            </li>
          ))}
        </ol>

        <form onSubmit={goNext} className="mt-6 rounded-3xl bg-card sticker p-6 md:p-8" noValidate>
          <div className="flex items-start gap-4 mb-6">
            <Companion id={d.companion} size={72} state={mascotState} className="flex-shrink-0 -mt-1" />
            <div>
              <h1 className="font-display text-3xl md:text-4xl">
                {step === 0 && (isAdult ? "Cuéntanos de ti" : "¿Quién va a aprender?")}
                {step === 1 && (isAdult ? "¿Qué te interesa?" : `¿Qué le gusta a ${who}?`)}
                {step === 2 && "Elige un compañero"}
              </h1>
              <p className="text-muted-foreground mt-1">
                {step === 0 && "Con esto ajustamos el nivel y el idioma de cada lección."}
                {step === 1 && "Usamos sus gustos como ejemplos para explicar cada tema."}
                {step === 2 && "Lo acompaña en cada lección. Puedes cambiarlo después."}
              </p>
            </div>
          </div>

          {step === 0 && (
            <div className="space-y-6">
              <div>
                <label htmlFor="name" className="label">Nombre</label>
                <input
                  id="name"
                  ref={nameRef}
                  value={d.childName}
                  onChange={(e) => update({ childName: e.target.value })}
                  placeholder={isAdult ? "Tu nombre" : "Ej. Mateo"}
                  maxLength={NAME_MAX + 5}
                  autoComplete="off"
                  aria-invalid={showErrors && !name}
                  className="field"
                />
              </div>

              <div>
                <span className="label" id="age-label">Edad</span>
                <div className="flex items-center gap-2" role="group" aria-labelledby="age-label">
                  <button type="button" onClick={() => setAge(d.age - 1)} className="btn-sticker bg-card h-12 w-12" aria-label="Menos">
                    <Minus className="h-4 w-4" />
                  </button>
                  <input
                    type="number"
                    inputMode="numeric"
                    min={minAge}
                    max={maxAge}
                    value={d.age}
                    onChange={(e) => setAge(Number(e.target.value))}
                    className="field !w-24 text-center text-lg font-bold tabular-nums"
                    aria-labelledby="age-label"
                  />
                  <button type="button" onClick={() => setAge(d.age + 1)} className="btn-sticker bg-card h-12 w-12" aria-label="Más">
                    <Plus className="h-4 w-4" />
                  </button>
                  <span className="hint ml-1">años</span>
                </div>
              </div>

              {levels.length > 1 && (
                <div>
                  <span className="label">Nivel escolar</span>
                  <div className="flex flex-wrap gap-2">
                    {levels.map((l) => (
                      <button
                        key={l.id}
                        type="button"
                        aria-pressed={d.level === l.id}
                        onClick={() => update({ level: l.id, levelTouched: true })}
                        className="chip"
                      >
                        {l.label}
                      </button>
                    ))}
                  </div>
                  {!d.levelTouched && <p className="hint mt-2">Lo sugerimos por la edad; cámbialo si no coincide.</p>}
                </div>
              )}

              <div>
                <span className="label">Idioma de las lecciones</span>
                <div className="flex flex-wrap gap-2">
                  {(
                    [
                      { id: "es", l: "Español" },
                      { id: "en", l: "Inglés" },
                      { id: "bi", l: "Bilingüe" },
                    ] as const
                  ).map((o) => (
                    <button
                      key={o.id}
                      type="button"
                      aria-pressed={d.language === o.id}
                      onClick={() => update({ language: o.id })}
                      className="chip"
                    >
                      {o.l}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-8">
              <div>
                <div className="flex items-baseline justify-between">
                  <span className="label">Temas favoritos</span>
                  <span className="hint tabular-nums">{d.interests.length} de {MAX_INTERESTS}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {presets.map((it) => {
                    const sel = d.interests.includes(it.id);
                    return (
                      <button
                        key={it.id}
                        type="button"
                        aria-pressed={sel}
                        disabled={!sel && interestsFull}
                        onClick={() => toggleInterest(it.id)}
                        className="chip"
                      >
                        {sel && <Check className="h-4 w-4" />}
                        {it.label}
                      </button>
                    );
                  })}
                  {customInterests.map((c) => (
                    <button key={c} type="button" aria-pressed onClick={() => toggleInterest(c)} className="chip">
                      {c} <X className="h-4 w-4" aria-label="Quitar" />
                    </button>
                  ))}
                </div>
                <div className="mt-3 flex gap-2">
                  <input
                    value={customInput}
                    onChange={(e) => setCustomInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addCustomInterest();
                      }
                    }}
                    placeholder={isAdult ? "Otro tema, ej. fotografía" : "Otro, ej. Minecraft o caballos"}
                    maxLength={40}
                    disabled={interestsFull}
                    className="field"
                    aria-label="Agregar otro tema"
                  />
                  <button
                    type="button"
                    onClick={addCustomInterest}
                    disabled={!customInput.trim() || interestsFull}
                    className="btn-sticker bg-card px-4"
                  >
                    Agregar
                  </button>
                </div>
              </div>

              <div>
                <span className="label">Materias</span>
                <div className="grid sm:grid-cols-2 gap-2">
                  {SUBJECTS.map((s) => {
                    const sel = d.subjects.some((x) => x.id === s.id);
                    return (
                      <button
                        key={s.id}
                        type="button"
                        aria-pressed={sel}
                        onClick={() => toggleSubject(s.id)}
                        className={`flex items-center gap-3 rounded-2xl border-2 border-ink p-2.5 text-left font-semibold transition ${sel ? "bg-lime shadow-[2px_2px_0_var(--ink)]" : "bg-card hover:bg-white"}`}
                      >
                        <SubjectIcon id={s.id} size={36} />
                        <span className="flex-1">{s.label}</span>
                        <span className={`grid h-6 w-6 place-items-center rounded-md border-2 border-ink ${sel ? "bg-ink text-white" : "bg-card"}`}>
                          {sel && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {d.subjects.length > 0 && (
                <div>
                  <span className="label">¿Cómo {isAdult ? "te va" : "le va"} en cada una?</span>
                  <p className="hint -mt-1 mb-3">Opcional. Así empezamos en el punto justo.</p>
                  <ul className="space-y-3">
                    {d.subjects.map((s) => {
                      const meta = SUBJECTS.find((x) => x.id === s.id)!;
                      return (
                        <li key={s.id}>
                          <span className="block text-sm font-semibold mb-1.5">{meta.label}</span>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5" role="radiogroup" aria-label={meta.label}>
                            {CONFIDENCE.map((c) => (
                              <button
                                key={c.v}
                                type="button"
                                role="radio"
                                aria-checked={s.difficulty === c.v}
                                onClick={() => setConfidence(s.id, c.v)}
                                className="chip !min-h-9 !px-2 text-sm"
                              >
                                {c.l}
                              </button>
                            ))}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-8">
              <div className="grid grid-cols-2 gap-3" role="radiogroup" aria-label="Compañero">
                {CHARACTER_LIST.map((c) => {
                  const sel = d.companion === c.id;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      role="radio"
                      aria-checked={sel}
                      onClick={() => update({ companion: c.id })}
                      className={`rounded-2xl border-2 border-ink p-3 text-left transition ${sel ? "bg-lime shadow-[3px_3px_0_var(--ink)]" : "bg-card hover:bg-white"}`}
                    >
                      <div className="flex justify-center">
                        <Companion id={c.id} size={88} state={sel ? "happy" : "idle"} interactive={false} />
                      </div>
                      <div className="font-display text-xl mt-1">{c.name}</div>
                      <div className="text-sm text-muted-foreground leading-snug">{c.tagline.es}</div>
                    </button>
                  );
                })}
              </div>
              <p className="font-hand text-2xl -rotate-1 text-center">“{CHARACTERS[d.companion].line.es}”</p>

              <div>
                <span className="label">¿Cuánto dura una sesión?</span>
                <div className="grid grid-cols-3 gap-2" role="radiogroup">
                  {SESSION.map((o) => (
                    <button
                      key={o.v}
                      type="button"
                      role="radio"
                      aria-checked={d.focus === o.v}
                      onClick={() => update({ focus: o.v })}
                      className={`rounded-2xl border-2 border-ink p-3 text-center transition ${d.focus === o.v ? "bg-lime shadow-[2px_2px_0_var(--ink)]" : "bg-card hover:bg-white"}`}
                    >
                      <div className="font-bold">{o.l}</div>
                      <div className="text-xs text-muted-foreground">{o.d}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {showErrors && stepErrors.length > 0 && (
            <ul role="alert" className="mt-6 rounded-xl border-2 border-destructive bg-destructive/5 px-4 py-3 text-sm text-destructive font-semibold space-y-1">
              {stepErrors.map((e) => (
                <li key={e}>{e}</li>
              ))}
            </ul>
          )}
          {saveError && (
            <p role="alert" className="mt-6 rounded-xl border-2 border-destructive bg-destructive/5 px-4 py-3 text-sm text-destructive font-semibold">
              {saveError}
            </p>
          )}

          <div className="flex gap-3 mt-8">
            {step > 0 && (
              <button type="button" onClick={() => setStep(step - 1)} className="btn-sticker bg-card px-5 h-12">
                <ArrowLeft className="h-4 w-4" /> Atrás
              </button>
            )}
            <button type="submit" disabled={saving} className="btn-sticker bg-primary text-primary-foreground flex-1 h-12 px-5">
              {saving ? "Creando perfil…" : step === STEPS.length - 1 ? "Crear perfil" : "Continuar"}
              {!saving && <ArrowRight className="h-4 w-4" />}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
