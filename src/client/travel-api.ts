import type { CreateTravelRunResponse, TravelRunSseEvent } from "../shared/travel-contracts";

const EVENT_TYPES: readonly TravelRunSseEvent["type"][] = [
  "run.started",
  "progress.updated",
  "widget.state",
  "run.waiting_for_user",
  "run.completed",
  "run.failed"
];

async function responseError(response: Response): Promise<Error> {
  try {
    const body = await response.json() as { message?: unknown };
    if (typeof body.message === "string") return new Error(body.message);
  } catch {
    // The status text below is enough when the server did not return JSON.
  }
  return new Error(`Сервер вернул ошибку ${response.status}.`);
}

export async function startTravelRun(
  message: string,
  onEvent: (event: TravelRunSseEvent) => void,
  onConnectionError: (error: Error) => void
): Promise<EventSource> {
  const response = await fetch("/api/travel-runs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message })
  });
  if (!response.ok) throw await responseError(response);

  const created = await response.json() as CreateTravelRunResponse;
  if (!created.runId) throw new Error("Сервер не вернул идентификатор поиска.");

  const source = new EventSource(`/api/travel-runs/${encodeURIComponent(created.runId)}/events`);
  for (const type of EVENT_TYPES) {
    source.addEventListener(type, (rawEvent) => {
      try {
        const event = JSON.parse((rawEvent as MessageEvent<string>).data) as TravelRunSseEvent;
        onEvent(event);
        if (event.type === "run.completed" || event.type === "run.failed" || event.type === "run.waiting_for_user") {
          source.close();
        }
      } catch {
        source.close();
        onConnectionError(new Error("Сервер прислал повреждённое событие."));
      }
    });
  }
  source.onerror = () => {
    source.close();
    onConnectionError(new Error("Поток обновлений прервался. Попробуйте ещё раз."));
  };
  return source;
}

