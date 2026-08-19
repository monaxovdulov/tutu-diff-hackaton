import type { IncomingMessage, ServerResponse } from "node:http";
import { createTravelRun } from "../runtime/travel-run-runtime";
import { travelRunStore } from "../runtime/travel-run-store";
import { streamTravelRun } from "../sse/travel-run-stream";

function json(response: ServerResponse, status: number, body: unknown): void {
  response.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(body));
}

async function readJson(request: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of request) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    size += buffer.length;
    if (size > 64 * 1024) throw new Error("PAYLOAD_TOO_LARGE");
    chunks.push(buffer);
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    throw new Error("INVALID_JSON");
  }
}

export async function handleTravelRunRoute(request: IncomingMessage, response: ServerResponse, url: URL): Promise<boolean> {
  if (request.method === "POST" && url.pathname === "/api/travel-runs") {
    try {
      const body = await readJson(request) as { message?: unknown };
      const message = typeof body.message === "string" ? body.message.trim() : "";
      if (!message || message.length > 1200) {
        json(response, 400, { message: "Запрос должен содержать от 1 до 1200 символов." });
        return true;
      }
      json(response, 202, createTravelRun(message));
    } catch (error) {
      const message = error instanceof Error && error.message === "PAYLOAD_TOO_LARGE"
        ? "Запрос слишком большой."
        : "Не удалось прочитать JSON-запрос.";
      json(response, 400, { message });
    }
    return true;
  }

  const eventsMatch = url.pathname.match(/^\/api\/travel-runs\/([0-9a-f-]+)\/events$/i);
  if (request.method === "GET" && eventsMatch?.[1]) {
    if (!streamTravelRun(eventsMatch[1], response)) json(response, 404, { message: "TravelRun не найден." });
    return true;
  }

  const runMatch = url.pathname.match(/^\/api\/travel-runs\/([0-9a-f-]+)$/i);
  if (request.method === "GET" && runMatch?.[1]) {
    const run = travelRunStore.get(runMatch[1]);
    const status = travelRunStore.status(runMatch[1]);
    if (!run || !status) json(response, 404, { message: "TravelRun не найден." });
    else json(response, 200, { runId: run.id, status, state: run.state });
    return true;
  }

  return false;
}

