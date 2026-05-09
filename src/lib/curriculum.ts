import { SUBJECTS, type IgnotoProfile, type Subject } from "./profile";

export interface LessonNode {
  id: string;
  subject: Subject;
  subjectLabel: string;
  emoji: string;
  title: string;
  topic: string;
  estMin: number;
  difficulty: number;
}

const TOPICS: Record<Subject, string[]> = {
  matematicas: ["Sumas mágicas", "Fracciones de pizza", "Geometría exploradora", "Multiplicación turbo", "Patrones secretos"],
  lectura: ["El héroe del cuento", "Palabras poderosas", "Inventa tu historia", "Detective de detalles", "Poesía con ritmo"],
  ciencias: ["Ciclo del agua", "Sistema solar", "Cuerpo humano", "Animales increíbles", "Experimentos en casa"],
  historia: ["Antiguos egipcios", "Edad media", "Inventos que cambiaron el mundo", "Civilizaciones perdidas", "Héroes de tu país"],
  geografia: ["Continentes y océanos", "Climas del mundo", "Mapas y brújulas", "Ciudades famosas", "Maravillas naturales"],
  arte: ["Colores y emociones", "Líneas y formas", "Artistas legendarios", "Crea tu cómic", "Escultura imaginaria"],
  musica: ["Ritmo y pulso", "Instrumentos del mundo", "Compositores famosos", "Crea tu canción", "Notas y melodías"],
  ingles: ["Greetings & friends", "Animals around me", "My family", "Action heroes verbs", "My favorite food"],
  programacion: ["Pensamiento lógico", "Bucles divertidos", "Variables como cajas", "Tu primer juego", "Algoritmos del día"],
  logica: ["Acertijos clásicos", "Patrones ocultos", "Sudoku junior", "Pensamiento lateral", "Detective lógico"],
};

export function buildCurriculum(profile: IgnotoProfile): LessonNode[] {
  const nodes: LessonNode[] = [];
  for (const s of profile.subjects) {
    const meta = SUBJECTS.find((x) => x.id === s.id)!;
    const topics = TOPICS[s.id];
    topics.forEach((t, i) => {
      nodes.push({
        id: `${s.id}-${i}`,
        subject: s.id,
        subjectLabel: meta.label,
        emoji: meta.emoji,
        title: t,
        topic: t,
        estMin: profile.style.focus === "5" ? 8 : profile.style.focus === "15" ? 15 : 25,
        difficulty: s.difficulty + Math.floor(i / 2),
      });
    });
  }
  return nodes;
}

export function dailyMission(profile: IgnotoProfile): LessonNode | null {
  const all = buildCurriculum(profile);
  return all.find((n) => !profile.completedLessons.includes(n.id)) ?? all[0] ?? null;
}

export function weeklyPlan(profile: IgnotoProfile) {
  const all = buildCurriculum(profile);
  const days = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
  return days.map((d, i) => ({ day: d, lessons: all.slice(i * 1, i * 1 + 2) }));
}
