## Objetivo

1. Que **todas** las respuestas del chat de IGNO incluyan una animación SVG (siempre, sin excepción), eligiendo el tipo según el contexto y variando entre las disponibles.
2. Mejorar las animaciones SVG de las lecciones: más detalle, movimiento más fluido, etiquetas y composición más rica.

---

## Parte 1 · Chat IGNO siempre con animación

**Cambios en `src/lib/ai.functions.ts` (prompt de `askIgno`):**
- Hacer obligatorio incluir un bloque `simulation` en cada respuesta (regla: "SIEMPRE incluye exactamente 1 'simulation' con el `kind` más específico que aplique").
- Listar explícitamente los 23 `kind` disponibles para que el modelo elija con criterio.
- Pedir que `title` y `caption` sean breves (ya que en el chat el espacio es reducido).

**Garantía en frontend (`src/components/Igno.tsx`):**
- Tras recibir la respuesta, si los bloques **no** contienen un `simulation`, inyectar uno automáticamente:
  - `kind` derivado por `inferSimulationKind(pregunta + texto de respuesta)`.
  - Si la inferencia da `generic`, rotar entre un pool de kinds visualmente atractivos (`wave`, `atom`, `solarSystem`, `musicNotes`, `geometry`, `lifeCycle`, `timeline`) usando un contador por sesión para no repetir el mismo seguidos.
- Si el modelo devuelve un `simulation` pero su `kind` es igual al último mostrado en el chat, sustituirlo por otro kind compatible para asegurar variedad visual.
- Insertar la simulación en una posición sensata (justo después del primer `text`).

**Resultado esperado:** cada burbuja de IGNO incluye una mini-animación contextual y nunca se repite la misma dos veces seguidas.

---

## Parte 2 · Mejorar las animaciones SVG de las lecciones

Reescribir los componentes en `src/components/gen-ui/AnimatedSimulation.tsx` para que se sientan más pulidos:

**Mejoras transversales:**
- Añadir un fondo con gradiente suave (radial/linear usando `<defs>`) en lugar del color plano.
- Añadir partículas/estrellas/burbujas de ambiente que floten sutilmente.
- Etiquetas de texto pequeñas para identificar las partes clave de cada escena (ej. "Sol", "CO₂", "raíz", "núcleo", "polo N/S"…), con animación de entrada con `<animate attributeName="opacity">`.
- Reemplazar `aspect-[16/9]` rígido por una composición que respira mejor en compact (chat) vs completo (lección): pequeñas variaciones de `viewBox` y stroke widths.
- Easing suave (`calcMode="spline"` con `keySplines`) en los movimientos clave para dar sensación de inercia.

**Escenas a mejorar con detalle adicional:**
- `photosynthesis`: añadir glucosa visible saliendo, raíces detalladas, gotas de agua subiendo por el tallo, sol con rayos que rotan con suavidad.
- `waterCycle`: gotas individuales animadas cayendo, vapor que sube de la superficie del agua, río que fluye, sol+nube con sombras.
- `solarSystem`: estrellas parpadeantes mejoradas, anillo de Saturno, lunas para algunos planetas.
- `heart`: añadir aurículas+ventrículos diferenciados, flechas direccionales del flujo sanguíneo, pulso ECG sincronizado con el latido.
- `atom`: nube electrónica difusa, etiquetas e⁻/p⁺/n⁰, brillos en el núcleo.
- `dna`: bases A-T / G-C con códigos de color, nucleótidos rotulados.
- `circuit`: bombilla con halo pulsante cuando hay corriente, símbolos eléctricos correctos (resistor, batería).
- `volcano`: chispas aleatorias, humo gris ascendente, suelo con grietas brillantes.
- `lifeCycle`: flechas curvas entre etapas con `marker-end`, cada etapa con ligera animación propia.
- `multiplication`: agrupar visualmente filas y columnas con líneas, marcador de "fila × columna".
- `timeline`: cada hito con un mini-icono (emoji) dentro del marcador.
- `wave`: añadir frecuencia/amplitud animadas, eje horizontal sutil.
- `rocket`: humo de despegue con partículas, estrellas con paralaje.
- `weather`: rayo ocasional, viento como líneas que pasan.
- `geometry`: rotación con escala alterna y etiquetas de nombre de figura.

**Nuevas escenas (para más variedad y mejor cobertura del temario):**
- `digestion` (sistema digestivo): comida descendiendo por un tubo estomago→intestino.
- `respiration` (pulmones inflando/desinflando con O₂/CO₂).
- `seasons` (Tierra orbitando con inclinación).
- `phaseChange` (sólido↔líquido↔gas con moléculas).
- `pendulum` (péndulo + reloj) para mecánica.
- `additionBlocks` para sumas/restas básicas.
- `mapRoute` para geografía/coordenadas.

Actualizar `SimulationKind`, `SIMULATION_KINDS`, el `z.enum` en `gen-blocks.ts`, las palabras clave de `inferSimulationKind`, y los prompts de la IA en `ai.functions.ts` para incluirlas.

**Quizzes y "Pruébalo":** mantener `QuizMotif` ya añadido, pero usar la versión `compact` mejorada con etiquetas más pequeñas para que no sature visualmente.

---

## Detalles técnicos

- Solo SVG nativo + `<animate>` / `<animateMotion>` / `<animateTransform>` (sin nuevas dependencias). Esto mantiene el peso bajo y la animación instantánea.
- Todas las paletas siguen los tokens `var(--primary)`, `var(--accent)`, `var(--mint)`, `var(--coral)`, `var(--sky)` para integrarse con los temas dinámicos existentes.
- Cada escena queda como función pequeña en el mismo archivo `AnimatedSimulation.tsx` para mantenerlo cohesivo. Si el archivo crece demasiado, dividir en `AnimatedSimulation.scenes.tsx`.
- Tras los cambios, `inferSimulationKind` sigue siendo el único punto de decisión cuando el AI no especifica `kind`, y se le añaden las palabras clave de las nuevas escenas.

---

## Archivos a modificar

- `src/components/gen-ui/AnimatedSimulation.tsx` — escenas mejoradas + nuevas + helper de rotación.
- `src/lib/gen-blocks.ts` — enum y zod ampliados.
- `src/lib/ai.functions.ts` — prompts (lección + chat) que listan los nuevos kinds y exigen simulación en el chat.
- `src/components/Igno.tsx` — garantía cliente de incluir simulación + anti-repetición.