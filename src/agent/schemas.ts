import { z } from "zod";
import type { TripRoute, TripWidgetState } from "../domain/trip-widget-state";
import type { TravelAgentResult } from "../shared/travel-contracts";

const impactSchema = z.object({
  tone: z.enum(["warning", "positive", "neutral"]),
  icon: z.enum(["metro", "taxi", "day", "comfort", "time", "info"]),
  text: z.string()
});

const differenceSchema = z.object({
  headline: z.string(),
  items: z.array(z.string()),
  actionLabel: z.string().nullable(),
  compareRouteId: z.string().nullable()
});

const routeSchema = z.object({
  id: z.string(),
  category: z.enum(["cheap", "balance", "comfort"]),
  title: z.string(),
  price: z.number().nonnegative(),
  departureTime: z.string(),
  arrivalTime: z.string(),
  subtitle: z.string(),
  analysisStatus: z.literal("ready"),
  impacts: z.array(impactSchema),
  difference: differenceSchema.nullable(),
  recommendationNote: z.string().nullable()
});

const widgetStateSchema = z.object({
  phase: z.enum(["conversation", "searching", "results", "enriching", "ready", "error"]),
  request: z.object({
    title: z.string(),
    items: z.array(z.object({
      text: z.string(),
      field: z.string().nullable(),
      value: z.string().nullable()
    }))
  }).nullable(),
  messages: z.array(z.object({
    id: z.string(),
    role: z.enum(["user", "assistant", "status"]),
    text: z.string()
  })),
  routes: z.array(routeSchema).max(3),
  selectedRouteId: z.string().nullable(),
  progressText: z.string().nullable(),
  recommendation: z.object({
    routeId: z.string(),
    text: z.string(),
    ctaLabel: z.string()
  }).nullable(),
  errorText: z.string().nullable()
});

export const travelAgentOutputSchema = z.object({
  status: z.enum(["completed", "needs_input", "failed"]),
  widgetState: widgetStateSchema.nullable(),
  summary: z.string().nullable(),
  question: z.string().nullable(),
  message: z.string().nullable()
});

function normalizeRoute(value: z.infer<typeof routeSchema>): TripRoute {
  return {
    id: value.id,
    category: value.category,
    title: value.title,
    price: value.price,
    departureTime: value.departureTime,
    arrivalTime: value.arrivalTime,
    subtitle: value.subtitle,
    analysisStatus: value.analysisStatus,
    impacts: value.impacts,
    ...(value.difference ? {
      difference: {
        headline: value.difference.headline,
        items: value.difference.items,
        ...(value.difference.actionLabel ? { actionLabel: value.difference.actionLabel } : {}),
        ...(value.difference.compareRouteId ? { compareRouteId: value.difference.compareRouteId } : {})
      }
    } : {}),
    ...(value.recommendationNote ? { recommendationNote: value.recommendationNote } : {})
  };
}

function normalizeWidgetState(value: z.infer<typeof widgetStateSchema>): TripWidgetState {
  return {
    phase: value.phase,
    request: value.request ? {
      title: value.request.title,
      items: value.request.items.map((item) => ({
        text: item.text,
        ...(item.field ? { field: item.field } : {}),
        ...(item.value ? { value: item.value } : {})
      }))
    } : null,
    messages: value.messages,
    routes: value.routes.map(normalizeRoute),
    selectedRouteId: value.selectedRouteId,
    progressText: value.progressText,
    recommendation: value.recommendation,
    errorText: value.errorText
  };
}

export function parseTravelAgentResult(input: unknown): TravelAgentResult {
  const value = travelAgentOutputSchema.parse(input);

  if (value.status === "completed") {
    if (!value.widgetState || !value.summary) throw new Error("Агент вернул неполный итог поездки.");
    const widgetState = normalizeWidgetState(value.widgetState);
    if (widgetState.routes.length < 2 || !widgetState.recommendation) {
      throw new Error("Агент не вернул минимум два варианта и рекомендацию.");
    }
    return { status: "completed", widgetState, summary: value.summary };
  }

  if (value.status === "needs_input") {
    if (!value.question) throw new Error("Агент не указал уточняющий вопрос.");
    return {
      status: "needs_input",
      question: value.question,
      ...(value.widgetState ? { partialState: normalizeWidgetState(value.widgetState) } : {})
    };
  }

  if (!value.message) throw new Error("Агент не объяснил ошибку.");
  return {
    status: "failed",
    message: value.message,
    ...(value.widgetState ? { partialState: normalizeWidgetState(value.widgetState) } : {})
  };
}

