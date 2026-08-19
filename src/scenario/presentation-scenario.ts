import type {
  TripRoute,
  TripWidgetState,
} from '../domain/trip-widget-state';
import { difference } from '../domain/difference';

export const PRESENTATION_STEPS = [
  'request',
  'options',
  'impacts',
  'difference',
  'constraint',
  'recommendation',
] as const;

export type PresentationStep = (typeof PRESENTATION_STEPS)[number];

export const PRESENTATION_STEP_LABELS: Record<PresentationStep, string> = {
  request: 'Запрос',
  options: 'Варианты',
  impacts: 'Последствия',
  difference: 'Реальная разница',
  constraint: 'Новое условие',
  recommendation: 'Рекомендация',
};

const TAXI_COST = { min: 600, max: 1200 } as const;

const nightRoute: TripRoute = {
  id: 'bb6d169c1deb5a1e2aeaa1266e71e25d',
  category: 'cheap',
  title: 'Дешёвый ночной · 100С',
  price: 3200.57,
  departureTime: '01:35',
  arrivalTime: '10:46',
  subtitle: 'Восточный → Московский · 9 ч 11 мин',
  analysisStatus: 'ready',
  impacts: [
    { tone: 'warning', icon: 'time', text: 'Отправление ночью, в 01:35' },
    { tone: 'positive', icon: 'info', text: 'Самый дешёвый билет' },
    { tone: 'neutral', icon: 'taxi', text: 'До BASE SPb: 600–1200 ₽*' },
  ],
  difference: null,
  recommendationNote: 'Исходный выбор: экономия важнее.',
};

const dayRoute: TripRoute = {
  id: '31f6cb698685d96289e753c5c15aa39e',
  category: 'balance',
  title: 'Дневная «Аврора» · 742У',
  price: 3615.38,
  departureTime: '06:00',
  arrivalTime: '11:45',
  subtitle: 'Ленинградский → Московский · 5 ч 45 мин',
  analysisStatus: 'ready',
  impacts: [
    { tone: 'positive', icon: 'day', text: 'Отправление уже не ночью' },
    { tone: 'positive', icon: 'time', text: 'На 3 ч 26 мин быстрее' },
    { tone: 'neutral', icon: 'taxi', text: 'До BASE SPb: 600–1200 ₽*' },
  ],
  difference: null,
  recommendationNote: null,
};

const comparison = difference.compare(
  {
    price: nightRoute.price,
    durationMinutes: 551,
    additionalCostMin: TAXI_COST.min,
    additionalCostMax: TAXI_COST.max,
  },
  {
    price: dayRoute.price,
    durationMinutes: 345,
    additionalCostMin: TAXI_COST.min,
    additionalCostMax: TAXI_COST.max,
  },
);

const request = {
  title: 'Москва → Санкт-Петербург',
  items: [
    { text: '5 сентября 2026', field: null, value: null },
    { text: 'На Московский вокзал до 15:00', field: null, value: null },
    { text: 'Река Фест · 17:00', field: null, value: null },
    { text: 'Исходный приоритет: сэкономить', field: null, value: null },
  ],
} as const;

const buildState = (
  routes: readonly TripRoute[],
  selectedRouteId: string,
  recommendationText: string,
): TripWidgetState => ({
  phase: 'ready',
  request,
  messages: [],
  routes,
  selectedRouteId,
  progressText: null,
  recommendation: {
    routeId: selectedRouteId,
    text: recommendationText,
    ctaLabel: 'Попробовать свой запрос',
  },
  errorText: null,
});

const initialState = buildState(
  [nightRoute, dayRoute],
  nightRoute.id,
  'Если главное — сэкономить, поезд 100С дешевле на 414,81 ₽.',
);

const constrainedDayRoute: TripRoute = {
  ...dayRoute,
  recommendationNote: 'Новая рекомендация: подходит под условие «не ночью».',
};

const constrainedState = buildState(
  [constrainedDayRoute],
  dayRoute.id,
  'После запрета отправляться ночью остаётся дневная «Аврора» 742У.',
);

const presentationStates: Record<PresentationStep, TripWidgetState> = {
  request: {
    ...initialState,
    phase: 'conversation',
    messages: [
      {
        id: 'scenario-user-request',
        role: 'user',
        text: 'Москва → Санкт-Петербург, 5 сентября. Хочу сэкономить и успеть на Река Фест к 17:00.',
      },
      {
        id: 'scenario-assistant-request',
        role: 'assistant',
        text: 'Понял. Ищу поезда с прибытием на Московский вокзал до 15:00.',
      },
    ],
    routes: [],
    selectedRouteId: null,
    recommendation: null,
  },
  options: {
    ...initialState,
    phase: 'results',
    messages: [{
      id: 'scenario-assistant-options',
      role: 'assistant',
      text: 'Нашёл два заметно разных варианта.',
    }],
    routes: initialState.routes.map((route) => ({
      ...route,
      analysisStatus: 'basic',
      impacts: [],
      recommendationNote: null,
    })),
    progressText: 'Проверяю, что скрывается за ценой…',
  },
  impacts: {
    ...initialState,
    phase: 'enriching',
    messages: [{
      id: 'scenario-assistant-impacts',
      role: 'assistant',
      text: 'Ночной дешевле, но отправляется в 01:35. Дневная «Аврора» заметно быстрее.',
    }],
    routes: [
      { ...nightRoute, recommendationNote: null },
      { ...dayRoute, analysisStatus: 'enriching' },
    ],
    progressText: 'Считаю полную стоимость и разницу во времени…',
  },
  difference: {
    ...initialState,
    messages: [{
      id: 'scenario-assistant-difference',
      role: 'assistant',
      text: 'Вот где выбор становится настоящим, а не только про цену билета.',
    }],
    routes: initialState.routes.map((route) => ({
      ...route,
      impacts: [],
      recommendationNote: null,
    })),
  },
  constraint: {
    ...initialState,
    phase: 'recalculating',
    messages: [{
      id: 'scenario-user-constraint',
      role: 'user',
      text: 'Не хочу отправляться ночью.',
    }],
    routes: initialState.routes.map((route) => ({
      ...route,
      impacts: [],
      recommendationNote: null,
    })),
    selectedRouteId: dayRoute.id,
    recommendation: constrainedState.recommendation,
    progressText: 'Исключаю отправления с 00:00 до 05:59…',
  },
  recommendation: {
    ...constrainedState,
    messages: [{
      id: 'scenario-assistant-recommendation',
      role: 'assistant',
      text: 'Тогда ночной 100С больше не подходит. Пересчитал без нового поиска.',
    }],
    routes: constrainedState.routes.map((route) => ({
      ...route,
      impacts: [],
    })),
  },
};

export const presentationScenario = {
  provenance: 'Данные Tutu · сохранены 19 августа 2026',
  event: {
    title: 'Река Фест Dark Edition',
    time: '5 сентября · 17:00',
    place: 'BASE SPb · Кондратьевский проспект, 44',
  },
  taxiEstimate: '600–1200 ₽',
  taxiSource: 'оценка Туту Разницы, не данные Tutu',
  initialState,
  constrainedState,
  excludedRouteIds: [nightRoute.id],
  difference: comparison,
} as const;

export const getPresentationState = (
  step: PresentationStep,
): TripWidgetState => {
  return structuredClone(presentationStates[step]);
};
