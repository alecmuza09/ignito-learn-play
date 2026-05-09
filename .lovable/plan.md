## Objetivo

Llevar IGNOTO al siguiente nivel de **Generative UI**: que la IA no solo rellene plantillas, sino que **decida la composición de la pantalla** — qué bloques renderizar, en qué orden, con qué interactividad — y que el **agente mute la UI en vivo** según los eventos del niño.

Hoy la lección tiene una estructura fija (hero → historia → 3-5 cards → quiz multiple choice). Vamos a romper esa rigidez.

---

## 1. Esquema de bloques (contrato IA ↔ UI)

Crear un **schema declarativo** que la IA devuelve y un **renderer** que lo pinta. Cualquier pantalla generativa se vuelve una lista de bloques tipados.

```ts
type GenBlock =
  | { type: "hero", title, subtitle, imagePrompt, tone }
  | { type: "text", body, emphasis?: "normal" | "fact" | "analogy" }
  | { type: "image", imagePrompt, caption, ratio: "16:9"|"4:3"|"1:1" }
  | { type: "compare", left:{label,imagePrompt}, right:{label,imagePrompt}, takeaway }
  | { type: "steps", title, items: {icon, label, body}[] }
  | { type: "callout", icon, title, body, tone }
  | { type: "mascotSays", text, mood }
  | { type: "tryIt", question, kind: "tap"|"sort"|"match"|"input", payload }
  | { type: "miniQuiz", question, options, answerIndex, explanation }
  | { type: "celebrate", message, particles }
```

La IA elige qué bloques usar y en qué orden por lección. Una lección de fracciones con un fan de Spiderman puede ser `hero → mascotSays → compare(media-pizza vs pizza-entera) → tryIt(match) → text → miniQuiz`. Una de historia puede ser `hero → steps → image → callout → miniQuiz`.

## 2. Renderer + componentes nuevos

- `<GenRenderer blocks={...} />` que mapea cada `type` a un componente generativo del design system.
- Nuevos primitivos en `src/components/gen-ui/`:
  - `GenCompare` — dos columnas con imágenes IA y un "→ por eso…".
  - `GenSteps` — timeline numerada con iconos del tema.
  - `GenCallout` — cita destacada (dato curioso / mini reto / advertencia) con tono adaptativo.
  - `GenMascotSays` — burbuja de la mascota KawaiiBlob (humor variable).
  - `GenTryIt` — micro-interacción inline (tap-the-correct, sort 3 items, match pairs, input numérico). Da feedback inmediato sin salir de la lección.
  - `GenMiniQuiz` — pregunta inline (no es el quiz final, vive entre los bloques).

Imágenes (`hero`, `image`, `compare`) se generan en paralelo con Nano Banana usando el `imagePrompt` que la IA emite, igual que hoy.

## 3. Lección como composición generada

`generateLesson` (en `src/lib/ai.functions.ts`) deja de devolver `{sections, quiz}` rígido y pasa a devolver `{ title, objective, blocks: GenBlock[], finalQuiz: GenBlock[] }`. El prompt instruye a la IA a:

- Variar la composición según materia, dificultad y `style.format` del perfil (video → más imágenes y steps; leer → más text+callout; jugar → más tryIt y miniQuiz).
- Ajustar densidad según `style.focus` (5 min → 4 bloques; 30 min → 8-10 bloques).
- Inyectar el `interest` activo en cada bloque visualmente relevante.

## 4. El agente toma control de la UI en vivo

Hoy `decideReaction` solo dispara un overlay efímero (`<GenReaction>`). Lo extendemos a un **mutador de layout**:

```ts
type AgentAction =
  | { kind: "reaction", payload: AgentReactionPayload }   // overlay actual
  | { kind: "insertBlock", at: "after-current"|"end", block: GenBlock }
  | { kind: "replaceBlock", id: string, block: GenBlock }
  | { kind: "highlight", blockId: string, tone: Tone }
  | { kind: "switchTone", tone: Tone }                    // re-tematiza la página
```

Ejemplos:
- 2 errores seguidos → agente inserta un `callout` con analogía + un `tryIt` más fácil.
- 3 aciertos → agente inserta un `celebrate` + un `miniQuiz` bonus de XP.
- "stuck" (timeout sin responder) → agente inserta `mascotSays` con pista visual.
- Inicio de sesión muy enérgica → `switchTone` a un acento más vivo.

`useUIAgent` se amplía para aplicar `insertBlock`/`replaceBlock` sobre el array de bloques activos del renderer, con animación de entrada (`animate-pop-in`).

## 5. Chat IGNO también renderiza bloques

El chat ya devuelve `IgnoBlock[]`. Lo unificamos al mismo `GenBlock`/`<GenRenderer>` para que IGNO pueda responder con un `compare`, un `tryIt` o un `miniQuiz` inline — no solo texto+imagen+ejemplo. "Explícame fracciones" devuelve un mini-ejercicio jugable dentro de la burbuja.

## 6. Personalización por perfil aún más visible

- `GenThemeBanner` muestra qué decisiones tomó la IA hoy ("Hoy elegí más imágenes porque te gusta ver", "Modo reto activo").
- Indicador sutil en cada bloque insertado por el agente: pequeño chip "🤖 IA en vivo" para que el niño *vea* que la página está cambiando para él.

## 7. Fuera de alcance (para no inflar)

- No tocamos registro/dashboard/mapa/padres salvo un mini-banner en dashboard que muestre "tu próxima lección la genera la IA al abrirla".
- No introducimos drag-and-drop pesado (el `tryIt sort` es tap-para-reordenar, no DnD).
- No reescribimos la mascota — seguimos con `KawaiiBlob`.
- No tocamos backend/DB — todo sigue en server functions + localStorage.

---

## Notas técnicas

- **Tipos**: nuevo archivo `src/lib/gen-blocks.ts` con `GenBlock`, `AgentAction`, validadores Zod (los usamos tanto al parsear la IA como al insertar bloques desde el agente).
- **Renderer**: `src/components/gen-ui/GenRenderer.tsx` — componente único que `switch`-ea por `type`. Cada bloque recibe un `id` estable (índice + uuid corto) para que el agente pueda referenciarlos.
- **Server fns**:
  - `generateLesson` — nueva forma de respuesta basada en bloques.
  - `decideReaction` → `decideAction` (retro-compatible: si retorna `reaction`, lo envolvemos en `{ kind: "reaction", ... }`).
- **Imágenes**: una sola pasada por `generateHeroImage` paralelo, agrupando todos los `imagePrompt` de los bloques al cargar la lección, igual que hoy.
- **Migración**: el cambio en `generateLesson` rompe la respuesta vieja → actualizamos `leccion.$id.tsx` para usar `<GenRenderer>` y borramos el render manual de `sections`/`quiz`. El `quiz` final se modela como una lista de `miniQuiz` consecutivos.
- **Estado**: `blocks` vive en estado React; el agente lo modifica con `setBlocks`. El renderer hace `key={block.id}` para que la animación de entrada se dispare al insertar.

```text
┌─────────────────────────────────────────┐
│ Profile + Theme + Subject + Difficulty  │
└──────────────┬──────────────────────────┘
               ▼
        generateLesson  ──────►  GenBlock[]
               │                      │
               │                      ▼
               │              <GenRenderer/>
               │                      ▲
               │                      │ insertBlock / replaceBlock
               ▼                      │
          on event ────►  decideAction (UI Agent)
        (correct/wrong/                │
         streak/stuck)                 │
                                       ▼
                              reaction overlay
                              + layout mutation
```

## Criterios de "hecho"

1. Dos lecciones del mismo niño con materias distintas tienen **layouts visiblemente diferentes** (no solo distinto texto en las mismas tarjetas).
2. Aciertar 3 seguidas hace aparecer un bloque nuevo *dentro de la lección*, no solo un overlay.
3. Una pregunta al chat sobre un tema visual devuelve un bloque interactivo (`tryIt` o `compare`) jugable.
4. Niño con `style.focus = "5"` recibe lección notablemente más corta que con `"30"`.