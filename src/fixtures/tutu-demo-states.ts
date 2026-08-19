import type { TripRoute, TripWidgetState } from "../domain/trip-widget-state";

const request = {
  title: "Москва → Санкт-Петербург",
  items: [
    { text: "24 мая", field: null, value: null },
    { text: "до 7 000 ₽", field: null, value: null },
    { text: "после концерта", field: null, value: null },
    { text: "без жёсткой ночной пересадки", field: null, value: null }
  ]
} as const;

const cheap: TripRoute = {
  id: "cheap",
  category: "cheap",
  title: "Дешевле",
  price: 4280,
  departureTime: "23:10",
  arrivalTime: "07:00",
  subtitle: "Ночной поезд",
  analysisStatus: "ready",
  impacts: [
    { tone: "warning", icon: "metro", text: "Метро уже закрыто" },
    { tone: "warning", icon: "taxi", text: "Такси ≈ 1 200–1 700 ₽" }
  ],
  difference: {
    headline: "Экономия 1 360 ₽ к Балансу",
    items: ["Дешевле на 1 360 ₽", "+3 ч 50 мин в пути", "Ночной переезд", "Возможно такси после прибытия"],
    actionLabel: "Сравнить с Балансом",
    compareRouteId: "balance"
  },
  recommendationNote: null
};

const balance: TripRoute = {
  id: "balance",
  category: "balance",
  title: "Баланс",
  price: 5640,
  departureTime: "06:40",
  arrivalTime: "10:40",
  subtitle: "Быстрее и днём",
  analysisStatus: "ready",
  impacts: [{ tone: "positive", icon: "day", text: "Прибытие днём" }],
  difference: {
    headline: "+1 360 ₽ к Дешевле",
    items: ["−3 ч 50 мин в дороге", "Прибытие днём", "Без ночного переезда", "Вероятно не понадобится такси"],
    actionLabel: "Сравнить с Комфортом",
    compareRouteId: "comfort"
  },
  recommendationNote: null
};

const comfort: TripRoute = {
  id: "comfort",
  category: "comfort",
  title: "Комфорт",
  price: 7100,
  departureTime: "07:30",
  arrivalTime: "11:50",
  subtitle: "Тише и просторнее",
  analysisStatus: "ready",
  impacts: [{ tone: "positive", icon: "comfort", text: "Тише в салоне" }],
  difference: {
    headline: "+1 460 ₽ к Балансу",
    items: ["Тише в салоне", "+20 мин в дороге", "Больше личного пространства"],
    actionLabel: "Сравнить с Балансом",
    compareRouteId: "balance"
  },
  recommendationNote: null
};

const base = (state: Partial<TripWidgetState>): TripWidgetState => ({
  phase: "idle",
  request: null,
  messages: [],
  routes: [],
  selectedRouteId: null,
  progressText: null,
  recommendation: null,
  errorText: null,
  ...state
});

const userText = "Мне нужно из Москвы в Питер\n24 мая после концерта.\nХочу подешевле, но без\nжёсткой ночной пересадки,\nбюджет до 7 000 ₽.";

export const TUTU_DEMO_STATES: readonly TripWidgetState[] = [
  base({ phase: "idle" }),
  base({
    phase: "conversation",
    messages: [
      { id: "user-1", role: "user", text: userText },
      { id: "assistant-1", role: "assistant", text: "Понял вас. Собираю критерии…" }
    ]
  }),
  base({ phase: "searching", request, progressText: "Ищу подходящие варианты…" }),
  base({
    phase: "results",
    request,
    routes: [cheap, balance, comfort].map((route) => ({ ...route, subtitle: "", impacts: [], analysisStatus: "enriching" as const }))
  }),
  base({
    phase: "enriching",
    request,
    routes: [cheap, balance, comfort].map((route) => ({ ...route, impacts: [], analysisStatus: "basic" as const })),
    progressText: "Проверяю транспорт после прибытия…"
  }),
  base({
    phase: "enriching",
    request,
    routes: [cheap, balance, comfort],
    progressText: "Считаю реальную разницу…"
  }),
  base({ phase: "detail", request, routes: [cheap, balance, comfort], selectedRouteId: "cheap" }),
  base({ phase: "detail", request, routes: [cheap, balance, comfort], selectedRouteId: "balance" }),
  base({
    phase: "recalculating",
    request: {
      ...request,
      items: [...request.items, { text: "такси допустимо", field: "taxi", value: "allowed" }]
    },
    messages: [{ id: "user-2", role: "user", text: "Такси всё-таки можно." }],
    routes: [cheap, balance, comfort],
    selectedRouteId: "cheap",
    progressText: "Обновляю сравнение…"
  }),
  base({
    phase: "ready",
    request: {
      ...request,
      items: [...request.items, { text: "такси допустимо", field: "taxi", value: "allowed" }]
    },
    routes: [{ ...cheap, recommendationNote: "Теперь подходит лучше" }, balance, comfort],
    selectedRouteId: "cheap",
    recommendation: {
      routeId: "cheap",
      text: "С учётом того, что такси допустимо, рекомендую Дешевле.",
      ctaLabel: "Выбрать билет"
    }
  })
];

export function getTutuDemoState(index: number): TripWidgetState {
  return structuredClone(TUTU_DEMO_STATES[Math.min(10, Math.max(1, index)) - 1] ?? TUTU_DEMO_STATES[0]!);
}
