import { runTravelAgent } from "../../agent/run-travel-agent";
import type { CreateTravelRunResponse } from "../../shared/travel-contracts";
import { createSearchingProjection } from "./travel-run-projection";
import { travelRunStore } from "./travel-run-store";

function publicError(error: unknown): string {
  const message = error instanceof Error ? error.message : "Неизвестная ошибка";
  if (message.includes("OPENAI_API_KEY")) return message;
  if (message.includes("Tutu MCP") || message.includes("difference.compare") || message.includes("неполный итог")) return message;
  return "Не получилось получить варианты у модели или Tutu. Попробуйте ещё раз позже.";
}

export function createTravelRun(message: string): CreateTravelRunResponse {
  const runId = travelRunStore.create();
  const searchingState = createSearchingProjection(message);
  travelRunStore.setState(runId, searchingState);
  travelRunStore.publish(runId, { type: "run.started", runId });
  travelRunStore.publish(runId, { type: "progress.updated", text: "Ищу подходящие варианты…" });
  queueMicrotask(() => void executeTravelRun(runId, message));
  return { runId, status: "running" };
}

async function executeTravelRun(runId: string, message: string): Promise<void> {
  try {
    const result = await runTravelAgent(message);
    if (result.status === "completed") {
      travelRunStore.setState(runId, result.widgetState);
      travelRunStore.publish(runId, { type: "widget.state", state: result.widgetState });
      travelRunStore.transition(runId, "COMPLETE");
      travelRunStore.publish(runId, { type: "run.completed", state: result.widgetState });
      return;
    }

    if (result.status === "needs_input") {
      if (result.partialState) {
        travelRunStore.setState(runId, result.partialState);
        travelRunStore.publish(runId, { type: "widget.state", state: result.partialState });
      }
      travelRunStore.transition(runId, "NEEDS_INPUT");
      travelRunStore.publish(runId, { type: "run.waiting_for_user", question: result.question });
      return;
    }

    travelRunStore.transition(runId, "FAIL");
    travelRunStore.publish(runId, { type: "run.failed", message: result.message });
  } catch (error) {
    travelRunStore.transition(runId, "FAIL");
    travelRunStore.publish(runId, { type: "run.failed", message: publicError(error) });
  }
}
