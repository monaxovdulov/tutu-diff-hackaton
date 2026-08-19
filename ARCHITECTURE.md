# Архитектура Туту Разницы

Документ фиксирует архитектуру после перехода от подготовленного демо к живому
вертикальному слайсу. Текущий код — Lit-виджет с заранее собранными состояниями.
Следующий шаг — подключить реальный агент, Tutu MCP и поток обновлений в виджет.

## Коротко

**Туту Разница** остаётся виджетом, который показывает не только цену билета, но
и последствия маршрута: лишнее ожидание, ночной переезд, такси, запас до события,
погодный риск и другие факторы.

Для первого живого слайса используем один агент:

```text
Пользователь
  ↓
Lit-виджет
  ↓ HTTP + SSE
Node.js API
  ↓
TravelRun runtime на XState
  ↓
OpenAI Agents SDK
  ↓
TravelAgent на GPT-5.6
  ├── Tutu MCP
  ├── web search
  ├── weather tool
  └── difference tool
```

Главный принцип: **модель решает, какие данные нужны, код держит границы и
считает проверяемые числа**.

## Презентационная оболочка

Presentation layout добавляет поверх живого виджета независимый `experience`:

```text
scenario → нормализованный snapshot → шесть шагов → локальный пересчёт
live     → Node API → XState TravelRun → TravelAgent → SSE
```

`layout` выбирает обычное встраивание или презентационную оболочку. Внутри неё
сохранён компактный чат с последовательным раскрытием состояний. `experience`
выбирает сохранённый сценарий или живой run. `presentationStep`, provenance,
событие и оценка такси принадлежат scenario-оболочке; `TripWidgetState` и
`TravelRunSseEvent` не расширены. Поэтому открытый SSE остаётся подключённым при
переходе в сценарий, а накопленный `sessionState` виден после возврата.

На demo-странице выбор `experience` и `presentationStep` расположен в лендинге
слева от виджета. Они передаются в публичные свойства Lit-компонента; сам shadow
DOM отвечает только за чат, карточки и open/close-поведение.

Source provenance лежит вне frontend-бандла в
`snapshots/presentation-source.json`. Браузер импортирует только нормализованные
данные из `src/scenario/presentation-scenario.ts`.

Production Compose состоит из `api` и `web`. nginx проксирует `/api/` в Node до
SPA fallback. `OPENAI_API_KEY` передаётся только runtime environment API-сервиса.

## Что уже есть

В репозитории уже есть:

- встраиваемый Lit-виджет;
- демо-состояния в `src/fixtures/tutu-demo-states.ts`;
- доменная модель состояния виджета в `src/domain/trip-widget-state.ts`;
- редьюсер событий виджета;
- ADR-001 про показ сравнения по мере готовности;
- документ `TUTU_MCP.md` с осторожными правилами работы с MCP Туту;
- задачи в `tasks/` через `mdtask`.

Пока нет:

- backend API;
- настоящего agent run;
- реальных вызовов модели;
- реальных вызовов Tutu MCP;
- persistence;
- SSE-потока с живыми событиями.

## Целевая структура

В первом вертикальном слайсе не надо сразу переносить фронтенд в `apps/web`.
Проект маленький, поэтому можно оставить текущую Vite-структуру и добавить
серверный слой рядом.

```text
src/
├── components/                 # текущий Lit UI
├── domain/                     # публичная модель состояния виджета
├── fixtures/                   # временное демо, пока живой режим не включён
├── server/
│   ├── main.ts                 # HTTP API
│   ├── routes/
│   │   └── travel-runs.ts
│   ├── sse/
│   │   └── travel-run-stream.ts
│   └── runtime/
│       ├── travel-run.machine.ts
│       ├── travel-run-runtime.ts
│       ├── travel-run-projection.ts
│       └── travel-run-store.ts
│
├── agent/
│   ├── travel-agent.ts
│   ├── travel-agent.prompt.md
│   ├── run-travel-agent.ts
│   └── schemas.ts
│
├── tools/
│   ├── tutu-mcp.ts
│   ├── weather-tool.ts
│   ├── difference-tool.ts
│   └── web-search.ts
│
└── shared/
    └── travel-contracts.ts
```

Позже, если проект вырастет, можно разделить на `apps/web`, `apps/api` и
`packages/*`. Для первого слайса это лишняя миграция.

## Основные компоненты

### Lit-виджет

Виджет остаётся пользовательским интерфейсом. Он:

- отправляет сообщение пользователя в backend;
- получает события через SSE;
- применяет их к `TripWidgetState`;
- показывает прогресс, карточки и итоговое сравнение.

Виджет не вызывает модель, Tutu MCP и погодный API напрямую. Это нужно, чтобы не
светить ключи и не разносить agent-runtime по браузеру.

### Node.js API

Backend нужен для четырёх вещей:

1. принять пользовательскую команду;
2. создать или продолжить `TravelRun`;
3. запустить Agents SDK;
4. отдать виджету поток событий.

Команды:

```text
POST /api/travel-runs
GET  /api/travel-runs/:runId
GET  /api/travel-runs/:runId/events
POST /api/travel-runs/:runId/messages
POST /api/travel-runs/:runId/cancel
```

Для первого слайса достаточно `POST /api/travel-runs` и SSE-потока.

### TravelRun runtime

`TravelRun` — одна пользовательская операция: пользователь написал запрос,
система ищет варианты, уточняет данные и отдаёт сравнение.

XState используется только как process manager:

```text
idle
  ↓
running
  ├── waitingForUser
  ├── completed
  ├── failed
  └── cancelled
```

XState не решает, нужно ли смотреть погоду или какой поезд лучше. Это делает
модель. Машина фиксирует жизненный цикл операции, поздние события, отмену,
ожидание человека и стабильную проекцию для UI.

### TravelAgent

Один агент на OpenAI Agents SDK. Он получает пользовательский запрос и сам
выбирает инструменты.

Он отвечает за:

- понимание намерения пользователя;
- выбор источников;
- вызов Tutu MCP;
- запрос погоды, если она влияет на сравнение;
- web search для фактов, которых нет в структурированных API;
- вызов deterministic difference tool;
- итоговое объяснение.

Не начинаем с multi-agent. Отдельные агенты появятся только после eval'ов, если
один агент стабильно путается из-за похожих tools или слишком длинной инструкции.

### Tutu MCP

Tutu MCP — основной источник вариантов поездки и отелей. Для первого слайса
подключаем только тот минимальный набор, который нужен для реального результата.

Начальный сценарий:

```text
Москва → Санкт-Петербург
дата из запроса пользователя
2–5 транспортных вариантов
итоговое сравнение в карточках
```

MCP-ответы нормализуются в нашу модель маршрута. UI не зависит от raw payload
Tutu.

### Weather tool

Погода не является частью Tutu MCP. Это отдельный function tool в Agents SDK.

Модель вызывает его только тогда, когда погодный факт может изменить сравнение.
Например раннее прибытие и долгое ожидание на улице.

### Difference tool

`difference.compare` — детерминированный инструмент. Он считает числа:

- разницу цены;
- разницу времени в пути;
- ожидание до заселения;
- ночные часы;
- запас до события;
- примерные дополнительные расходы, если они переданы агентом.

LLM объясняет результат, но не считает эти величины текстом.

### Web search

Web search используется для фактов, которые трудно получить структурированно:

- время события;
- работа метро;
- правила площадки;
- ранний check-in;
- камеры хранения;
- локальные ограничения.

Для первого слайса web search можно оставить включённым, но не делать его
обязательным для happy path.

## Поток первого живого сценария

```text
1. Пользователь пишет запрос в виджет.
2. Виджет отправляет POST /api/travel-runs.
3. Backend создаёт TravelRun.
4. XState переводит run в running.
5. Agents SDK запускает TravelAgent.
6. TravelAgent вызывает Tutu MCP.
7. Backend стримит в UI: «Ищу варианты…».
8. TravelAgent получает варианты и оставляет 2–3 различающихся кандидата.
9. TravelAgent вызывает difference.compare.
10. Backend стримит карточки в текущий TripWidgetState.
11. TravelAgent возвращает структурированный итог.
12. XState переводит run в completed.
13. UI показывает рекомендацию.
```

Если модели не хватает данных, она возвращает статус `needs_input`. Тогда
`TravelRun` переходит в `waitingForUser`, а UI показывает вопрос.

## Контракты между слоями

Форма доменных DTO, типизация событий и границы mutable-коллекций зафиксированы в
[ADR-007](decisions/007-architecture-state-contracts-and-runtime-collections.md).
На публичных границах используем обычные сериализуемые объекты и массивы;
`Map`, `Set` и mutable-журнал остаются внутри `TravelRunStore`.

### Agent result

Агент должен вернуть структурированный результат:

```ts
type TravelAgentResult =
  | {
      status: "completed";
      widgetState: TripWidgetState;
      summary: string;
    }
  | {
      status: "needs_input";
      question: string;
      partialState?: TripWidgetState;
    }
  | {
      status: "failed";
      message: string;
      partialState?: TripWidgetState;
    };
```

### SSE event

UI получает не raw agent events, а продуктовые события:

```ts
type TravelRunSseEvent =
  | { type: "run.started"; runId: string }
  | { type: "progress.updated"; text: string }
  | { type: "widget.state"; state: TripWidgetState }
  | { type: "run.waiting_for_user"; question: string }
  | { type: "run.completed"; state: TripWidgetState }
  | { type: "run.failed"; message: string };
```

## Package manager

Используем `pnpm`. Старые npm-команды в документации и Justfile заменяем на
`pnpm`.

Базовые команды:

```bash
pnpm install
pnpm dev
pnpm build
pnpm check
pnpm exec mdtask list
pnpm exec mdtask validate
```

## Переменные окружения

Минимальный набор для живого слайса:

```text
OPENAI_API_KEY=...
TUTU_MCP_URL=https://mcp.tutu.ru/mcp
WEATHER_PROVIDER=mock
```

Для первого слайса погода может работать через mock/tool stub, если основной
пользовательский сценарий не зависит от неё. Реальные вызовы модели и Tutu MCP
обязательны.

## Что не делаем в первом слайсе

- не делаем покупку билета;
- не делаем полноценную авторизацию пользователя;
- не делаем multi-agent;
- не подключаем Codex App Server;
- не используем Python;
- не переносим всё в монорепо, если текущая структура ещё справляется;
- не пишем ручной rule engine для выбора инструментов;
- не вызываем Tutu MCP из браузера;
- не строим сложную parallel state machine.

## Связанные решения

- [ADR-001 · product · Показываем сравнение по мере готовности](decisions/001-product-live-comparison.md)
- [ADR-002 · technology · Используем pnpm](decisions/002-technology-pnpm.md)
- [ADR-003 · architecture · Один TravelAgent на Agents SDK](decisions/003-architecture-agents-sdk-travel-agent.md)
- [ADR-004 · architecture · XState управляет только жизненным циклом TravelRun](decisions/004-architecture-xstate-travelrun-lifecycle.md)
- [ADR-005 · architecture · Инструменты агента и внешние источники](decisions/005-architecture-agent-tools.md)
- [ADR-006 · architecture · Виджет получает продуктовые события через SSE](decisions/006-architecture-widget-sse.md)

## Внешние основания

- OpenAI Agents guide: single-agent сначала, multi-agent только при реальной
  сложности, tools должны быть хорошо описаны и проверяемы.
- OpenAI Agents SDK: function tools, hosted tools, MCP, streaming, HITL,
  `RunState`, tracing.
- GPT-5.6 guidance: Programmatic Tool Calling для bounded tool-heavy этапов,
  tool search для больших tool surfaces, prompts лучше держать короче.
- XState v6 alpha: state machines, actors, invoke, typed schemas, persistence и
  inspection. Alpha-версию закрепляем точно и изолируем внутри runtime.
