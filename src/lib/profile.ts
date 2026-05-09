import { useEffect, useState } from "react";

export type LearningLevel = "preescolar" | "primaria-1-3" | "primaria-4-6" | "secundaria" | "preparatoria";
export type Subject = "matematicas" | "lectura" | "ciencias" | "historia" | "geografia" | "arte" | "musica" | "ingles" | "programacion" | "logica";
export type Difficulty = 1 | 2 | 3 | 4;

export interface IgnotoProfile {
  ownerRole: "nino" | "papa" | "tutor";
  avatar: string;
  childName: string;
  age: number;
  level: LearningLevel;
  language: "es" | "en" | "bi";
  interests: string[];
  subjects: { id: Subject; difficulty: Difficulty }[];
  style: { format: string; focus: string; mode: string };
  xp: number;
  coins: number;
  streak: number;
  badges: string[];
  completedLessons: string[];
  createdAt: string;
}

const KEY = "ignoto.profile.v1";

export function loadProfile(): IgnotoProfile | null {
  if (typeof window === "undefined") return null;
  try { const raw = localStorage.getItem(KEY); return raw ? JSON.parse(raw) : null; } catch { return null; }
}
export function saveProfile(p: IgnotoProfile) {
  localStorage.setItem(KEY, JSON.stringify(p));
  window.dispatchEvent(new Event("ignoto:profile"));
}
export function clearProfile() { localStorage.removeItem(KEY); window.dispatchEvent(new Event("ignoto:profile")); }
export function updateProfile(patch: Partial<IgnotoProfile>) {
  const p = loadProfile(); if (!p) return;
  saveProfile({ ...p, ...patch });
}
export function awardXP(amount: number) {
  const p = loadProfile(); if (!p) return;
  saveProfile({ ...p, xp: p.xp + amount, coins: p.coins + Math.floor(amount / 5) });
}
export function markLessonDone(id: string) {
  const p = loadProfile(); if (!p) return;
  if (p.completedLessons.includes(id)) return;
  saveProfile({ ...p, completedLessons: [...p.completedLessons, id] });
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
