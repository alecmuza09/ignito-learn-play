import "@tanstack/react-start";
import { createFileRoute } from "@tanstack/react-router";
import { TEXT_MODELS, geminiGenerate, geminiKey } from "@/lib/gemini-models";

const COPILOTKIT_VERSION = "1.57.1";
const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";
const MODEL = "google/gemini-3-flash-preview";

type CopilotMessageInput = {
  id?: string;
  textMessage?: { content?: string; role?: string; parentMessageId?: string | null };
  actionExecutionMessage?: { name?: string; arguments?: string; parentMessageId?: string | null };
  resultMessage?: { result?: string; actionExecutionId?: string; actionName?: string };
};

type CopilotActionInput = {
  name: string;
  description?: string;
  jsonSchema?: string;
};

type CopilotRequestPayload = {
  operationName?: string;
  query?: string;
  variables?: {
    data?: {
      messages?: CopilotMessageInput[];
      context?: Array<{ description?: string; value?: string }>;
      frontend?: { actions?: CopilotActionInput[]; toDeprecate_fullContext?: string };
      threadId?: string;
    };
  };
};

const jsonHeaders = {
  "Content-Type": "application/json",
  "X-CopilotKit-Runtime-Version": COPILOTKIT_VERSION,
};

function makeId(prefix: string) {
  return `${prefix}-${crypto.randomUUID()}`;
}

function asPromptMessages(data: NonNullable<CopilotRequestPayload["variables"]>["data"]) {
  const messages = data?.messages ?? [];
  const context = data?.context ?? [];
  const actions = data?.frontend?.actions ?? [];
  const fullContext = data?.frontend?.toDeprecate_fullContext;

  const systemParts = [
    "Eres IGNO, un compañero de aprendizaje con IA. Responde SIEMPRE en español, con tono claro, cálido y dinámico.",
    "Adapta el tono a la audiencia del contexto: si audience es \"kids\", habla como un amigo divertido para niños con frases cortas (nunca uses emojis); si es \"adult\", sé un mentor experto, preciso y respetuoso, sin infantilizar y con ejemplos prácticos del mundo real.",
    "Devuelve ÚNICAMENTE JSON válido con esta forma: {\"text\":\"respuesta\",\"toolName\":\"nombre o null\",\"args\":{...}}.",
    "Primero responde bien la pregunta en text (2 a 5 frases, datos correctos y verificables, sin inventar). Si la pregunta es ambigua, di cómo la interpretas.",
    "Añade una herramienta visual SOLO si ayuda a entender ESTA pregunta. Si no aporta, usa toolName null.",
    "Elección de herramienta: presentDiagram para historia, fechas, procesos, pasos o comparaciones (con etiquetas específicas del tema, nunca genéricas como \"Era\" o \"Paso 1\"); presentQuiz o presentTryIt para practicar; presentStorySteps para explicar un proceso paso a paso; presentSimulation SOLO si un kind dibuja literalmente el concepto (no existe un kind para todo: si no hay uno exacto, no lo uses).",
    "Todo lo que pongas en la herramienta (títulos, etiquetas, pasos, opciones) debe ser coherente con text y factualmente correcto. En quizzes, answerIndex apunta a la única respuesta correcta.",
    "Los gustos del niño sirven para ejemplos y analogías, pero nunca cambian los hechos ni sustituyen el tema.",
    actions.length
      ? `Herramientas disponibles y sus parámetros JSON: ${actions.map((action) => `${action.name}: ${action.description ?? ""}\n${action.jsonSchema ?? ""}`).join("\n\n")}`
      : "",
    context.length
      ? `Contexto del niño:\n${context.map((item) => `${item.description ?? "Contexto"}: ${item.value ?? ""}`).join("\n")}`
      : "",
    fullContext ? `Contexto adicional:\n${fullContext}` : "",
  ].filter(Boolean).join("\n\n");

  const chatMessages = messages.flatMap((message) => {
    if (message.textMessage) {
      const role = message.textMessage.role === "assistant" ? "assistant" : "user";
      return [{ role, content: message.textMessage.content ?? "" }];
    }
    if (message.resultMessage) {
      return [{ role: "user", content: `Resultado de la actividad visual: ${message.resultMessage.result ?? ""}` }];
    }
    return [];
  });

  return [{ role: "system", content: systemParts }, ...chatMessages];
}

function normalizeToolArguments(value: unknown) {
  if (typeof value === "string") return value;
  if (value && typeof value === "object") return JSON.stringify(value);
  return "{}";
}

function parseModelJson(content?: string | null) {
  if (!content) return null;
  const cleaned = content.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```$/i, "").trim();
  try {
    return JSON.parse(cleaned) as { toolName?: string; args?: unknown; text?: string };
  } catch {
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start >= 0 && end > start) {
      try {
        return JSON.parse(cleaned.slice(start, end + 1)) as { toolName?: string; args?: unknown; text?: string };
      } catch {
        return null;
      }
    }
    return null;
  }
}

async function callModel(data: NonNullable<CopilotRequestPayload["variables"]>["data"]) {
  if (geminiKey()) {
    const promptMessages = asPromptMessages(data);
    const system = promptMessages.find((message) => message.role === "system")?.content ?? "";
    const contents = promptMessages
      .filter((message) => message.role !== "system")
      .map((message) => ({
        role: message.role === "assistant" ? "model" : "user",
        parts: [{ text: message.content }],
      }));

    const gemini = (await geminiGenerate(TEXT_MODELS, {
      systemInstruction: { role: "system", parts: [{ text: system }] },
      contents: contents.length ? contents : [{ role: "user", parts: [{ text: "Saluda y propone aprender algo divertido." }] }],
      generationConfig: { responseMimeType: "application/json", temperature: 0.4 },
    })) as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
    return { choices: [{ message: { content: gemini.candidates?.[0]?.content?.parts?.map((part) => part.text ?? "").join("") ?? "" } }] };
  }

  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("Falta configurar la conexión de IA");

  const body = {
    model: MODEL,
    messages: asPromptMessages(data),
    temperature: 0.4,
    response_format: { type: "json_object" },
  };

  const response = await fetch(GATEWAY_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Error de IA ${response.status}: ${detail.slice(0, 180)}`);
  }

  return response.json() as Promise<{
    choices?: Array<{
      message?: {
        content?: string | null;
      };
    }>;
  }>;
}

function successStatus() {
  return { __typename: "SuccessMessageStatus", code: "Success" };
}

async function handleGenerate(payload: CopilotRequestPayload) {
  const data = payload.variables?.data;
  const result = await callModel(data);
  const message = result.choices?.[0]?.message ?? {};
  const parsed = parseModelJson(message.content);
  const now = new Date().toISOString();
  const assistantId = makeId("assistant");
  const outputMessages: unknown[] = [];

  const allowed = new Set((data?.frontend?.actions ?? []).map((a) => a.name));
  const toolName = typeof parsed?.toolName === "string" && allowed.has(parsed.toolName) ? parsed.toolName : null;
  const toolArgs = parsed?.args;
  if (toolName && toolArgs && typeof toolArgs === "object") {
    outputMessages.push({
      __typename: "ActionExecutionMessageOutput",
      id: makeId("tool"),
      createdAt: now,
      name: toolName,
      arguments: [normalizeToolArguments(toolArgs)],
      parentMessageId: assistantId,
      status: successStatus(),
    });
  }

  const content = parsed?.text?.trim() || (parsed ? "" : message.content?.trim()) || "No pude armar una buena respuesta. ¿Me lo preguntas de otra forma?";
  outputMessages.push({
    __typename: "TextMessageOutput",
    id: assistantId,
    createdAt: now,
    content: [content],
    role: "assistant",
    parentMessageId: null,
    status: successStatus(),
  });

  return {
    data: {
      generateCopilotResponse: {
        __typename: "CopilotResponse",
        threadId: data?.threadId ?? makeId("thread"),
        runId: makeId("run"),
        extensions: null,
        status: { __typename: "SuccessResponseStatus", code: "Success" },
        messages: outputMessages,
        metaEvents: [],
      },
    },
  };
}

function handleQuery(payload: CopilotRequestPayload) {
  if (payload.operationName === "availableAgents" || payload.query?.includes("availableAgents")) {
    return { data: { availableAgents: { __typename: "AgentsResponse", agents: [] } } };
  }
  if (payload.operationName === "loadAgentState" || payload.query?.includes("loadAgentState")) {
    return {
      data: {
        loadAgentState: {
          __typename: "LoadAgentStateResponse",
          threadId: payload.variables?.data?.threadId ?? makeId("thread"),
          threadExists: false,
          state: "{}",
          messages: "[]",
        },
      },
    };
  }
  return null;
}

async function handle(request: Request) {
  if (request.method === "GET") {
    return new Response("ok", { headers: jsonHeaders });
  }

  try {
    const payload = await request.json() as CopilotRequestPayload;
    const queryResult = handleQuery(payload);
    const body = queryResult ?? await handleGenerate(payload);
    return new Response(JSON.stringify(body), { headers: jsonHeaders });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error desconocido";
    return new Response(JSON.stringify({ errors: [{ message }] }), { status: 500, headers: jsonHeaders });
  }
}

export const Route = createFileRoute("/api/copilotkit")({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => handle(request),
      GET: async ({ request }: { request: Request }) => handle(request),
    },
  },
});