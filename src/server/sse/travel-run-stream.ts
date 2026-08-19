import type { ServerResponse } from "node:http";
import type { SequencedTravelRunEvent } from "../runtime/travel-run-store";
import { travelRunStore } from "../runtime/travel-run-store";

const TERMINAL_EVENTS = new Set(["run.completed", "run.failed", "run.waiting_for_user"]);

function writeEvent(response: ServerResponse, item: SequencedTravelRunEvent): void {
  response.write(`id: ${item.id}\n`);
  response.write(`event: ${item.event.type}\n`);
  response.write(`data: ${JSON.stringify(item.event)}\n\n`);
}

export function streamTravelRun(runId: string, response: ServerResponse): boolean {
  if (!travelRunStore.get(runId)) return false;

  response.writeHead(200, {
    "Content-Type": "text/event-stream; charset=utf-8",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
    "X-Accel-Buffering": "no"
  });
  response.flushHeaders();

  let closed = false;
  let unsubscribe = () => {};
  const close = () => {
    if (closed) return;
    closed = true;
    clearInterval(heartbeat);
    unsubscribe();
    response.end();
  };
  const send = (item: SequencedTravelRunEvent) => {
    if (closed) return;
    writeEvent(response, item);
    if (TERMINAL_EVENTS.has(item.event.type)) close();
  };
  const subscription = travelRunStore.subscribe(runId, send);
  if (!subscription) return false;
  unsubscribe = subscription.unsubscribe;
  const heartbeat = setInterval(() => response.write(": heartbeat\n\n"), 15_000);

  for (const item of subscription.history) {
    send(item);
    if (closed) break;
  }
  response.on("close", close);
  return true;
}

