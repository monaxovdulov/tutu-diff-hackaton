import type { TripWidgetState } from "../../domain/trip-widget-state";

export function createSearchingProjection(message: string): TripWidgetState {
  return {
    phase: "searching",
    request: {
      title: message.split(".", 1)[0]?.trim() || "Новая поездка",
      items: [{ text: "Запрос принят", field: null, value: null }]
    },
    messages: [
      { id: "user-1", role: "user", text: message },
      { id: "assistant-1", role: "assistant", text: "Понял. Ищу реальные варианты…" }
    ],
    routes: [],
    selectedRouteId: null,
    progressText: "Ищу подходящие варианты…",
    recommendation: null,
    errorText: null
  };
}
