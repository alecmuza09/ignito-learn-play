## Problema confirmado

Inspeccionando la red en vivo, la server function `generateHeroImage` está respondiendo con `url: ""` para **todas** las llamadas (lección y chat). El modelo `google/gemini-2.5-flash-image` ya no está devolviendo `message.images[]` por el gateway. La UI sigue mostrando los placeholders ("🎨 IGNO está dibujando…") indefinidamente.

Además, el sistema actual sigue una receta fija (un único `generateLesson` → `blocks[]`), lo que choca con el principio del paper de Google: **planner + tools + post-processing** con la IA decidiendo composición y assets dinámicamente.

---

## Objetivo

1. **Arreglar la generación de imágenes** (causa inmediata del bug).
2. **Acercar IGNOTO al modelo Generative UI de Google**: pipeline en 3 etapas (planner → tools → post-process), assets ricos de verdad (no solo texto envuelto en bloques), y estilo visual consistente por sesión.

---

## Cambios

### 1. Reparar imágenes (`src/lib/ai.functions.ts`)

- Cambiar `IMAGE_MODEL` a `google/gemini-3.1-flash-image-preview` (Nano Banana 2, rápido + actual).
- En `callAI`, hacer la extracción de imágenes más robusta: aceptar tanto `message.images[].image_url.url` como `message.content` con partes tipo `image_url`/`b64_json` (los gateways a veces devuelven inlined base64 → convertir a `data:image/png;base64,...`).
- Si la primera llamada devuelve `url` vacía, **reintentar una vez** con `google/gemini-3-pro-image-preview` como fallback de mayor calidad.
- Loggear (`console.warn`) cuando el gateway devuelve respuesta sin imagen para que aparezca en server logs.
- Añadir el **estilo visual de la sesión** al `fullPrompt` (ver §3) para consistencia entre todas las imágenes de la lección.

### 2. Pipeline Generative UI estilo Google (3 etapas)

Refactorizar `generateLesson` para imitar la arquitectura del paper:

**Etapa A — Planner (`planLesson`)**: una llamada rápida a Gemini 3 Flash que **decide la estructura** antes de escribir contenido. Devuelve:
```
{
  "styleSpec": { "palette": "...", "illustrationStyle": "...", "vibe": "..." },
  "outline": [ { "type": "hero"|"compare"|..., "intent": "..." }, ... ],
  "tools": ["image"|"webSearch"|"miniGame"]
}
```
Esto separa "qué experiencia construir" de "cómo redactarla", igual que el paper.

**Etapa B — Composer**: la llamada actual, pero recibe el `outline` de la etapa A en el prompt (ya no inventa la estructura desde cero). Resultado: composiciones realmente distintas entre lecciones (no solo distinto texto en las mismas tarjetas).

**Etapa C — Post-process** (`postProcessLesson`):
- Asegurar `id` únicos.
- Auto-corregir bloques inválidos (rellena defaults, elimina los que no parsean).
- Si no hay ningún bloque visual (`hero`/`image`/`compare`), inyectar un `image` derivado del título.
- Garantizar exactamente 1 `mascotSays` y al menos un `tryIt`.
- Adjuntar el `styleSpec` al objeto `lesson` para que el frontend lo aplique a toda la sesión.

### 3. Estilo visual consistente por sesión

Como en los ejemplos "Wizard Green" del artículo: todas las imágenes de una lección comparten estilo.

- `LessonShape` gana `styleSpec: { palette, illustrationStyle, vibe }`.
- `generateHeroImage` recibe ese `styleSpec` opcionalmente y lo concatena al prompt.
- En `leccion.$id.tsx`, pasar `styleSpec` a cada `genImg(...)`.

### 4. Tools reales para la IA (no solo texto)

Inspirado en el "tool access" del paper. En el `composer` añadir un mini contrato de herramientas:
- `image(prompt)` → ya existe vía `generateHeroImage`.
- `simulation(kind, params)` → nuevo bloque `tryIt` `kind: "sim"` (p. ej. fracciones interactivas, balanza, conteo) — empezamos con **una sola simulación**: una `fractionBar` (renderer SVG en frontend).
- Esto demuestra el principio sin inflar: la IA puede pedir una simulación dinámica, no solo texto e imagen.

Añadir `FractionSimBlock` al `gen-blocks.ts` y a `GenRenderer.tsx` (interactivo, sin librerías nuevas).

### 5. Chat IGNO también arregla imágenes

`src/components/Igno.tsx` ya llama a `generateHeroImage` para `IgnoBlock.image`. Como arreglamos la función raíz, el chat se cura solo. Verificar que el componente sigue inyectando la URL al recibirla.

### 6. Indicadores "IA en vivo"

Pequeño polish para que el usuario *vea* el paradigma:
- En el `GenThemeBanner`: mostrar el `vibe` del `styleSpec` ("Hoy: estilo cómic Marvel + paleta carmesí").
- Reintentos de imagen muestran un estado distinto al placeholder (un shimmer en lugar de un emoji estático).

---

## Archivos a tocar

- `src/lib/ai.functions.ts` — modelo de imagen, extracción robusta, fallback, planner/composer/post-process, `styleSpec`.
- `src/lib/gen-blocks.ts` — añadir `fractionBar` (o `sim`) opcional + tipo `StyleSpec`.
- `src/components/gen-ui/GenRenderer.tsx` — render del nuevo bloque de simulación, shimmer de imagen.
- `src/components/gen-ui/primitives.tsx` — `GenThemeBanner` muestra el `vibe`.
- `src/routes/leccion.$id.tsx` — pasar `styleSpec` al image gen, manejar `lesson.styleSpec`.
- `src/components/Igno.tsx` — verificación + (si aplica) reintento ante `url` vacía.

## Fuera de alcance

- No tocamos auth, dashboard, mapa, padres, registro.
- No introducimos drag-and-drop ni librerías nuevas.
- No cambiamos la mascota ni el sistema de tema base.
- No tocamos backend/DB.

## Cómo lo verifico

1. Abrir una lección → debe haber imágenes reales en hero, image y compare en menos de ~10s.
2. Dos lecciones del mismo niño con materias distintas → composición visiblemente diferente (diferente orden, diferentes tipos de bloques).
3. Chat: pedir "explícame los planetas" → bloque imagen carga.
4. Server logs no muestran warnings "image gateway returned empty".
5. Si el modelo flash falla, fallback a pro entrega imagen de todos modos.
