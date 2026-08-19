import type { TripWidgetState } from "../domain/trip-widget-state";

export type TravelRunStatus = "running" | "waitingForUser" | "completed" | "failed";

export type TravelAgentResult =
  | { status: "completed"; widgetState: TripWidgetState; summary: string }
  | { status: "needs_input"; question: string; partialState?: TripWidgetState }
  | { status: "failed"; message: string; partialState?: TripWidgetState };

export type TravelRunSseEvent =
  | { type: "run.started"; runId: string }
  | { type: "progress.updated"; text: string }
  | { type: "widget.state"; state: TripWidgetState }
  | { type: "run.waiting_for_user"; question: string }
  | { type: "run.completed"; state: TripWidgetState }
  | { type: "run.failed"; message: string };

export type CreateTravelRunRequest = { message: string };
export type CreateTravelRunResponse = { runId: string; status: TravelRunStatus };

