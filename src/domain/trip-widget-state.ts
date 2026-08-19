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
  actionLabel: string | null;
  compareRouteId: string | null;
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
  difference: TripDifference | null;
  recommendationNote: string | null;
};

export type TripRequestItem = {
  text: string;
  field: string | null;
  value: string | null;
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
  errorText: string | null;
};

type TripWidgetEventEnvelope = {
  id?: number | string;
};

type TripWidgetEventPayloads = {
  "request.updated": {
    request: TripRequest | null;
    phase?: TripWidgetPhase;
  };
  "messages.updated": {
    messages: readonly TripMessage[];
    phase?: TripWidgetPhase;
  };
  "routes.selected": {
    routeId: string | null;
    phase?: TripWidgetPhase;
  };
  "route.updated": {
    route: Partial<TripRoute> & Pick<TripRoute, "id">;
    phase?: TripWidgetPhase;
  };
  "comparison.updated": {
    routeId: string;
    difference: TripDifference;
    phase?: TripWidgetPhase;
  };
  "progress.updated": {
    text: string | null;
    phase?: TripWidgetPhase;
  };
  "recommendation.updated": {
    recommendation: TripRecommendation | null;
    selectedRouteId: string | null;
    phase?: TripWidgetPhase;
  };
  "session.failed": {
    message: string;
  };
};

export type TripWidgetEvent = TripWidgetEventEnvelope & {
  [Type in keyof TripWidgetEventPayloads]: {
    type: Type;
    payload: TripWidgetEventPayloads[Type];
  };
}[keyof TripWidgetEventPayloads];

export function reduceTripWidgetState(state: TripWidgetState, event: TripWidgetEvent): TripWidgetState {
  switch (event.type) {
    case "request.updated":
      return {
        ...state,
        request: event.payload.request,
        phase: event.payload.phase ?? state.phase
      };
    case "messages.updated":
      return {
        ...state,
        messages: event.payload.messages,
        phase: event.payload.phase ?? state.phase
      };
    case "routes.selected":
      return {
        ...state,
        selectedRouteId: event.payload.routeId,
        phase: event.payload.phase ?? state.phase
      };
    case "route.updated": {
      const { route } = event.payload;
      return {
        ...state,
        routes: state.routes.map((current) => current.id === route.id ? { ...current, ...route } : current),
        phase: event.payload.phase ?? state.phase
      };
    }
    case "comparison.updated": {
      const { routeId, difference } = event.payload;
      return {
        ...state,
        routes: state.routes.map((route) => route.id === routeId ? { ...route, difference } : route),
        phase: event.payload.phase ?? state.phase
      };
    }
    case "progress.updated":
      return {
        ...state,
        progressText: event.payload.text,
        phase: event.payload.phase ?? state.phase
      };
    case "recommendation.updated":
      return {
        ...state,
        recommendation: event.payload.recommendation,
        selectedRouteId: event.payload.selectedRouteId,
        progressText: null,
        phase: event.payload.phase ?? "ready"
      };
    case "session.failed":
      return {
        ...state,
        phase: "error",
        progressText: null,
        errorText: event.payload.message
      };
  }
}
