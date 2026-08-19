export type TripWidgetPhase =
  | "idle"
  | "conversation"
  | "searching"
  | "results"
  | "enriching"
  | "detail"
  | "recalculating"
  | "ready"
  | "error";

export type TripMessage = {
  id: string;
  role: "user" | "assistant" | "status";
  text: string;
};

export type TripImpact = {
  tone: "warning" | "positive" | "neutral";
  icon: "metro" | "taxi" | "day" | "comfort" | "time" | "info";
  text: string;
};

export type TripDifference = {
  headline: string;
  items: readonly string[];
  actionLabel?: string;
  compareRouteId?: string;
};

export type TripRoute = {
  id: string;
  category: "cheap" | "balance" | "comfort";
  title: string;
  price: number;
  departureTime: string;
  arrivalTime: string;
  subtitle: string;
  analysisStatus: "basic" | "enriching" | "ready";
  impacts: readonly TripImpact[];
  difference?: TripDifference;
  recommendationNote?: string;
};

export type TripRequestItem = {
  text: string;
  field?: string;
  value?: string;
};

export type TripRequest = {
  title: string;
  items: readonly TripRequestItem[];
};

export type TripRecommendation = {
  routeId: string;
  text: string;
  ctaLabel: string;
};

export type TripWidgetState = {
  phase: TripWidgetPhase;
  request: TripRequest | null;
  messages: readonly TripMessage[];
  routes: readonly TripRoute[];
  selectedRouteId: string | null;
  progressText: string | null;
  recommendation: TripRecommendation | null;
  errorText?: string | null;
};

export type TripWidgetEvent = {
  id?: number | string;
  type:
    | "request.updated"
    | "messages.updated"
    | "routes.selected"
    | "route.updated"
    | "comparison.updated"
    | "progress.updated"
    | "recommendation.updated"
    | "session.failed";
  payload?: Record<string, unknown>;
};

export function reduceTripWidgetState(state: TripWidgetState, event: TripWidgetEvent): TripWidgetState {
  const payload = event.payload ?? {};

  switch (event.type) {
    case "request.updated":
      return {
        ...state,
        request: (payload.request as TripRequest | null | undefined) ?? state.request,
        phase: (payload.phase as TripWidgetPhase | undefined) ?? state.phase
      };
    case "messages.updated":
      return {
        ...state,
        messages: (payload.messages as readonly TripMessage[] | undefined) ?? state.messages,
        phase: (payload.phase as TripWidgetPhase | undefined) ?? state.phase
      };
    case "routes.selected":
      return {
        ...state,
        selectedRouteId: (payload.routeId as string | null | undefined) ?? state.selectedRouteId,
        phase: (payload.phase as TripWidgetPhase | undefined) ?? state.phase
      };
    case "route.updated": {
      const route = payload.route as Partial<TripRoute> & Pick<TripRoute, "id">;
      if (!route?.id) return state;
      return {
        ...state,
        routes: state.routes.map((current) => current.id === route.id ? { ...current, ...route } : current),
        phase: (payload.phase as TripWidgetPhase | undefined) ?? state.phase
      };
    }
    case "comparison.updated": {
      const routeId = payload.routeId as string | undefined;
      const difference = payload.difference as TripDifference | undefined;
      if (!routeId || !difference) return state;
      return {
        ...state,
        routes: state.routes.map((route) => route.id === routeId ? { ...route, difference } : route),
        phase: (payload.phase as TripWidgetPhase | undefined) ?? state.phase
      };
    }
    case "progress.updated":
      return {
        ...state,
        progressText: (payload.text as string | null | undefined) ?? null,
        phase: (payload.phase as TripWidgetPhase | undefined) ?? state.phase
      };
    case "recommendation.updated":
      return {
        ...state,
        recommendation: (payload.recommendation as TripRecommendation | null | undefined) ?? state.recommendation,
        selectedRouteId:
          (payload.selectedRouteId as string | null | undefined) ?? state.selectedRouteId,
        progressText: null,
        phase: (payload.phase as TripWidgetPhase | undefined) ?? "ready"
      };
    case "session.failed":
      return {
        ...state,
        phase: "error",
        progressText: null,
        errorText: (payload.message as string | undefined) ?? "Не получилось обновить варианты. Попробуйте уточнить запрос."
      };
  }
}
