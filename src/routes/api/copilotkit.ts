import "@tanstack/react-start";
import { createFileRoute } from "@tanstack/react-router";
import {
  CopilotRuntime,
  GoogleGenerativeAIAdapter,
  copilotRuntimeNextJSAppRouterEndpoint,
} from "@copilotkit/runtime";

function buildHandler() {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) return null;
  // Adapter reads GOOGLE_API_KEY from env via LangChain's ChatGoogleGenerativeAI.
  process.env.GOOGLE_API_KEY = apiKey;
  const serviceAdapter = new GoogleGenerativeAIAdapter({ model: "gemini-2.5-flash" });
  const runtime = new CopilotRuntime();
  const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
    runtime,
    serviceAdapter,
    endpoint: "/api/copilotkit",
  });
  return handleRequest;
}

const handle = async (request: Request) => {
  const handler = buildHandler();
  if (!handler) return new Response("Missing GOOGLE_API_KEY", { status: 500 });
  return handler(request as never);
};

export const Route = createFileRoute("/api/copilotkit")({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => handle(request),
      GET: async ({ request }: { request: Request }) => handle(request),
    },
  },
});