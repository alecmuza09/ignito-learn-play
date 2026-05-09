import "@tanstack/react-start";
import { createFileRoute } from "@tanstack/react-router";

const COPILOTKIT_VERSION = "1.57.1";
const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";
const MODEL = "google/gemini-3-flash-preview";
const SIMULATION_KINDS = [
  "photosynthesis", "waterCycle", "fractionBar", "logicPath", "solarSystem", "heart", "atom",
  "ecosystem", "foodChain", "circuit", "magnet", "gravity", "dna", "volcano", "geometry",
  "multiplication", "alphabet", "timeline", "musicNotes", "lifeCycle", "weather", "rocket",
  "wave", "digestion", "respiration", "seasons", "phaseChange", "pendulum", "additionBlocks",
  "mapRoute", "generic",
];

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
    "Eres IGNO, un tutor educativo para niños. Responde SIEMPRE en español, con tono claro, cálido y dinámico.",
    "Devuelve ÚNICAMENTE JSON válido con esta forma: {\"toolName\":\"presentSimulation\",\"args\":{...},\"text\":\"1 a 3 frases\"}.",
    `Si usas presentSimulation, el campo args.kind debe ser uno de: ${SIMULATION_KINDS.join(", ")}. Usa generic solo si nada más encaja.`,
    "La herramienta visual debe estar directamente relacionada con el tema preguntado y con los gustos/contexto del niño. Evita animaciones genéricas.",
    "Después de la herramienta, el campo text debe complementar la visualización con una idea clave o una pregunta corta.",
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
      return [{ role: "tool", content: message.resultMessage.result ?? "" }];
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
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("Falta configurar la conexión de IA");

  const body = {
    model: MODEL,
    messages: asPromptMessages(data),
    temperature: 0.8,
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

  if (parsed?.toolName) {
    outputMessages.push({
      __typename: "ActionExecutionMessageOutput",
      id: makeId("tool"),
      createdAt: now,
      name: parsed.toolName,
      arguments: [normalizeToolArguments(parsed.args)],
      parentMessageId: assistantId,
      status: successStatus(),
    });
  }

  const content = parsed?.text?.trim() || message.content?.trim() || "¡Mira esta idea en movimiento! ¿Qué parte quieres explorar ahora?";
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
  if (payload.operationName === "availableAgents") {
    return { data: { availableAgents: { __typename: "AgentsResponse", agents: [] } } };
  }
  if (payload.operationName === "loadAgentState") {
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