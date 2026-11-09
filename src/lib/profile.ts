import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Database, Json } from "@/integrations/supabase/types";

export type LearningLevel = "preescolar" | "primaria-1-3" | "primaria-4-6" | "secundaria" | "preparatoria" | "adulto";
export type Subject = "matematicas" | "lectura" | "ciencias" | "historia" | "geografia" | "arte" | "musica" | "ingles" | "programacion" | "logica";
export type Difficulty = 1 | 2 | 3 | 4;
export type LearnerKind = "child" | "adult";
export type CompanionId = "igno" | "chispa" | "bolt" | "luna";

export interface IgnotoProfile {
  /** Supabase learners.id; absent only for legacy local-only profiles. */
  id?: string;
  kind: LearnerKind;
  ownerRole: "nino" | "papa" | "tutor";
  avatar: string;
  childName: string;
  age: number;
  level: LearningLevel;
  language: "es" | "en" | "bi";
  interests: string[];
  subjects: { id: Subject; difficulty: Difficulty }[];
  style: { format: string; focus: string; mode: string };
  companion: CompanionId;
  voiceEnabled: boolean;
  xp: number;
  coins: number;
  streak: number;
  badges: string[];
  completedLessons: string[];
  createdAt: string;
}

type LearnerRow = Database["public"]["Tables"]["learners"]["Row"];

const KEY = "ignoto.profile.v1";
const LEGACY_KEY = "ignoto.profile.legacy";

export const COMPANION_IDS: CompanionId[] = ["igno", "chispa", "bolt", "luna"];

export function rowToProfile(r: LearnerRow): IgnotoProfile {
  const kind: LearnerKind = r.kind === "adult" ? "adult" : "child";
  return {
    id: r.id,
    kind,
    ownerRole: kind === "adult" ? "tutor" : "nino",
    avatar: r.avatar,
    childName: r.name,
    age: r.age,
    level: r.level as LearningLevel,
    language: (r.language as IgnotoProfile["language"]) ?? "es",
    interests: r.interests ?? [],
    subjects: (r.subjects as unknown as IgnotoProfile["subjects"]) ?? [],
    style: { format: "video", focus: "15", mode: "solo", ...((r.style as Record<string, string>) ?? {}) },
    companion: (COMPANION_IDS.includes(r.companion as CompanionId) ? r.companion : "igno") as CompanionId,
    voiceEnabled: r.voice_enabled,
    xp: r.xp,
    coins: r.coins,
    streak: r.streak,
    badges: r.badges ?? [],
    completedLessons: r.completed_lessons ?? [],
    createdAt: r.created_at,
  };
}

function profileToRow(p: IgnotoProfile) {
  return {
    kind: p.kind,
    name: p.childName,
    avatar: p.avatar,
    age: p.age,
    level: p.level,
    language: p.language,
    interests: p.interests,
    subjects: p.subjects as unknown as Json,
    style: p.style as unknown as Json,
    companion: p.companion,
    voice_enabled: p.voiceEnabled,
    xp: p.xp,
    coins: p.coins,
    streak: p.streak,
    badges: p.badges,
    completed_lessons: p.completedLessons,
  };
}

function normalize(raw: Partial<IgnotoProfile>): IgnotoProfile {
  return {
    kind: raw.kind ?? (raw.ownerRole && raw.ownerRole !== "nino" && (raw.age ?? 0) >= 16 ? "adult" : "child"),
    companion: "igno",
    voiceEnabled: true,
    ...raw,
  } as IgnotoProfile;
}

/** Profile of the active learner, cached locally so every screen can read it synchronously. */
export function loadProfile(): IgnotoProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const p = normalize(JSON.parse(raw));
    return p.id ? p : null;
  } catch {
    return null;
  }
}

/** Pre-accounts profile created on this device, kept so it can be imported into a family. */
export function loadLegacyProfile(): IgnotoProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const p = JSON.parse(raw);
      if (!p.id) {
        localStorage.setItem(LEGACY_KEY, raw);
        localStorage.removeItem(KEY);
      }
    }
    const legacy = localStorage.getItem(LEGACY_KEY);
    return legacy ? normalize(JSON.parse(legacy)) : null;
  } catch {
    return null;
  }
}
export function dismissLegacyProfile() {
  localStorage.removeItem(LEGACY_KEY);
}

let pushTimer: ReturnType<typeof setTimeout> | undefined;
function schedulePush(p: IgnotoProfile) {
  if (!p.id) return;
  clearTimeout(pushTimer);
  const id = p.id;
  pushTimer = setTimeout(() => {
    void supabase
      .from("learners")
      .update({ ...profileToRow(p), last_active_at: new Date().toISOString() })
      .eq("id", id)
      .then(({ error }) => {
        if (error) console.warn("[profile] sync failed:", error.message);
      });
  }, 500);
}

function writeCache(p: IgnotoProfile) {
  localStorage.setItem(KEY, JSON.stringify(p));
  window.dispatchEvent(new Event("ignoto:profile"));
}

export function saveProfile(p: IgnotoProfile) {
  writeCache(p);
  schedulePush(p);
}
export function clearActiveLearner() {
  if (typeof window === "undefined") return;
  clearTimeout(pushTimer);
  localStorage.removeItem(KEY);
  window.dispatchEvent(new Event("ignoto:profile"));
}
/** Kept for older call sites: "reset" now means leaving the active learner. */
export const clearProfile = clearActiveLearner;

export function updateProfile(patch: Partial<IgnotoProfile>) {
  const p = loadProfile(); if (!p) return;
  saveProfile({ ...p, ...patch });
}
export function awardXP(amount: number) {
  const p = loadProfile(); if (!p) return;
  saveProfile({ ...p, xp: p.xp + amount, coins: p.coins + Math.floor(amount / 5) });
  void logActivity("xp", { amount });
}
export function markLessonDone(id: string) {
  const p = loadProfile(); if (!p) return;
  if (p.completedLessons.includes(id)) return;
  saveProfile({ ...p, completedLessons: [...p.completedLessons, id] });
  void logActivity("lesson_done", { lessonId: id });
}

export async function logActivity(type: string, detail: Record<string, unknown> = {}) {
  const p = loadProfile();
  const { data } = await supabase.auth.getSession();
  const owner = data.session?.user.id;
  if (!owner) return;
  await supabase.from("activity_log").insert({ owner_id: owner, learner_id: p?.id ?? null, type, detail: detail as Json });
}

function dayDiff(fromIso: string, to = new Date()) {
  const a = new Date(fromIso); a.setHours(0, 0, 0, 0);
  const b = new Date(to); b.setHours(0, 0, 0, 0);
  return Math.round((b.getTime() - a.getTime()) / 86_400_000);
}

/** Makes a learner active on this device and rolls their daily streak forward. */
export async function activateLearner(row: LearnerRow) {
  const p = rowToProfile(row);
  const gap = dayDiff(row.last_active_at);
  if (gap === 1) p.streak += 1;
  else if (gap > 1) p.streak = 1;
  writeCache(p);
  await supabase.from("learners").update({ streak: p.streak, last_active_at: new Date().toISOString() }).eq("id", row.id);
  void logActivity("session_start", { streak: p.streak });
  return p;
}

export async function listLearners() {
  const { data, error } = await supabase.from("learners").select("*").order("created_at");
  if (error) throw error;
  return data;
}

export async function createLearner(p: Omit<IgnotoProfile, "id" | "createdAt">) {
  const { data: sess } = await supabase.auth.getSession();
  const owner = sess.session?.user.id;
  if (!owner) throw new Error("Inicia sesión para crear un perfil.");
  const { data, error } = await supabase
    .from("learners")
    .insert({ ...profileToRow({ ...p, createdAt: "" }), owner_id: owner })
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function deleteLearner(id: string) {
  const { error } = await supabase.from("learners").delete().eq("id", id);
  if (error) throw error;
  if (loadProfile()?.id === id) clearActiveLearner();
}

/** "adult" UI for adult learners; kids UI otherwise. */
export function uiModeFor(p: IgnotoProfile | null): "kids" | "adult" {
  return p?.kind === "adult" ? "adult" : "kids";
}

export function useProfile() {
  const [profile, setProfile] = useState<IgnotoProfile | null>(null);
  useEffect(() => {
    setProfile(loadProfile());
    const h = () => setProfile(loadProfile());
    window.addEventListener("ignoto:profile", h);
    window.addEventListener("storage", h);
    return () => { window.removeEventListener("ignoto:profile", h); window.removeEventListener("storage", h); };
  }, []);
  return profile;
}

export const LEVELS: { id: LearningLevel; label: string }[] = [
  { id: "preescolar", label: "Preescolar" },
  { id: "primaria-1-3", label: "Primaria 1–3" },
  { id: "primaria-4-6", label: "Primaria 4–6" },
  { id: "secundaria", label: "Secundaria" },
  { id: "preparatoria", label: "Preparatoria" },
  { id: "adulto", label: "Adulto" },
];

export const SUBJECTS: { id: Subject; label: string; emoji: string; color: string }[] = [
  { id: "matematicas", label: "Matemáticas", emoji: "🔢", color: "primary" },
  { id: "lectura", label: "Lectura y Escritura", emoji: "📚", color: "coral" },
  { id: "ciencias", label: "Ciencias", emoji: "🔬", color: "mint" },
  { id: "historia", label: "Historia", emoji: "🏛️", color: "accent" },
  { id: "geografia", label: "Geografía", emoji: "🌍", color: "sky" },
  { id: "arte", label: "Arte", emoji: "🎨", color: "coral" },
  { id: "musica", label: "Música", emoji: "🎵", color: "primary" },
  { id: "ingles", label: "Inglés", emoji: "🗣️", color: "sky" },
  { id: "programacion", label: "Programación", emoji: "💻", color: "mint" },
  { id: "logica", label: "Lógica", emoji: "🧩", color: "accent" },
];

export const AVATARS = ["🦊", "🦉", "🐼", "🦁", "🐸", "🦄", "🐙", "🦖", "🐯", "🐧", "🦋", "🐢"];

export const INTERESTS_BY_AGE: Record<string, { id: string; label: string; emoji: string }[]> = {
  adult: [
    { id: "carrera", label: "Crecimiento profesional", emoji: "📈" },
    { id: "finanzas", label: "Finanzas personales", emoji: "💰" },
    { id: "ia", label: "Inteligencia artificial", emoji: "🤖" },
    { id: "idiomas", label: "Idiomas", emoji: "🗣️" },
    { id: "emprender", label: "Emprendimiento", emoji: "🚀" },
    { id: "salud", label: "Salud y bienestar", emoji: "🧘" },
    { id: "historia", label: "Historia y cultura", emoji: "🏛️" },
    { id: "ciencia", label: "Ciencia", emoji: "🔭" },
    { id: "crianza", label: "Acompañar a mis hijos", emoji: "👨‍👩‍👧" },
    { id: "creatividad", label: "Arte y creatividad", emoji: "🎨" },
  ],
  young: [
    { id: "dinos", label: "Dinosaurios", emoji: "🦖" },
    { id: "espacio", label: "Espacio", emoji: "🚀" },
    { id: "animales", label: "Animales", emoji: "🐾" },
    { id: "superheroes", label: "Superhéroes", emoji: "🦸" },
    { id: "musica", label: "Música", emoji: "🎵" },
    { id: "magia", label: "Magia", emoji: "🪄" },
    { id: "robots", label: "Robots", emoji: "🤖" },
    { id: "cocina", label: "Cocina", emoji: "🍕" },
    { id: "deportes", label: "Deportes", emoji: "⚽" },
    { id: "naturaleza", label: "Naturaleza", emoji: "🌳" },
  ],
  mid: [
    { id: "ciencia", label: "Ciencia", emoji: "🧪" },
    { id: "deportes", label: "Deportes", emoji: "🏀" },
    { id: "videojuegos", label: "Videojuegos", emoji: "🎮" },
    { id: "arte", label: "Arte", emoji: "🎨" },
    { id: "programacion", label: "Programación", emoji: "💻" },
    { id: "cocina", label: "Cocina", emoji: "👨‍🍳" },
    { id: "musica", label: "Música", emoji: "🎸" },
    { id: "animales", label: "Animales", emoji: "🐶" },
    { id: "espacio", label: "Espacio", emoji: "🪐" },
    { id: "lectura", label: "Lectura", emoji: "📖" },
    { id: "viajes", label: "Viajes", emoji: "✈️" },
    { id: "cine", label: "Cine", emoji: "🎬" },
  ],
  teen: [
    { id: "stem", label: "STEM", emoji: "⚙️" },
    { id: "humanidades", label: "Humanidades", emoji: "📜" },
    { id: "arte", label: "Arte y Diseño", emoji: "🎨" },
    { id: "tecnologia", label: "Tecnología", emoji: "💡" },
    { id: "negocios", label: "Negocios", emoji: "💼" },
    { id: "salud", label: "Salud", emoji: "🩺" },
    { id: "deportes", label: "Deportes", emoji: "🏆" },
    { id: "musica", label: "Música", emoji: "🎧" },
    { id: "ambiental", label: "Medio Ambiente", emoji: "🌱" },
    { id: "comunicacion", label: "Comunicación", emoji: "📱" },
  ],
};

export function interestsForAge(age: number) {
  if (age >= 18) return INTERESTS_BY_AGE.adult;
  if (age <= 7) return INTERESTS_BY_AGE.young;
  if (age <= 12) return INTERESTS_BY_AGE.mid;
  return INTERESTS_BY_AGE.teen;
}

export function levelTitle(xp: number) {
  if (xp < 100) return { name: "Explorador", next: 100 };
  if (xp < 300) return { name: "Aventurero", next: 300 };
  if (xp < 700) return { name: "Sabio", next: 700 };
  if (xp < 1500) return { name: "Maestro", next: 1500 };
  return { name: "Leyenda", next: xp };
}
