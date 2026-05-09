import "@tanstack/react-start";
import { createFileRoute } from "@tanstack/react-router";
import {
  CopilotRuntime,
  GoogleGenerativeAIAdapter,
  copilotRuntimeNextJSAppRouterEndpoint,
} from "@copilotkit/runtime";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const Route = createFileRoute("/api/copilotkit")({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        const apiKey = process.env.GOOGLE_API_KEY;
        if (!apiKey) {
          return new Response("Missing GOOGLE_API_KEY", { status: 500 });
        }
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const serviceAdapter = new GoogleGenerativeAIAdapter({ model } as never);
        const runtime = new CopilotRuntime();
        const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
          runtime,
          serviceAdapter,
          endpoint: "/api/copilotkit",
        });
        return handleRequest(request as never);
      },
      GET: async ({ request }: { request: Request }) => {
        const apiKey = process.env.GOOGLE_API_KEY;
        if (!apiKey) return new Response("Missing GOOGLE_API_KEY", { status: 500 });
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const serviceAdapter = new GoogleGenerativeAIAdapter({ model } as never);
        const runtime = new CopilotRuntime();
        const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
          runtime,
          serviceAdapter,
          endpoint: "/api/copilotkit",
        });
        return handleRequest(request as never);
      },
    },
  },
});