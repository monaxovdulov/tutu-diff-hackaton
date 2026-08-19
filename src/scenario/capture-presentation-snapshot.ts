import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { loadEnvFile } from 'node:process';
import { run, type ModelResponse } from '@openai/agents';
import { z } from 'zod';
import { createTravelAgent } from '../agent/travel-agent';
import { parseTravelAgentResult } from '../agent/schemas';
import type { TravelAgentContext } from '../tools/difference-tool';
import { DEFAULT_TUTU_MCP_URL } from '../tools/tutu-mcp';

const SOURCE_SNAPSHOT_PATH = 'snapshots/presentation-source.json';

const offerSchema = z.object({
  offer_id: z.string(),
  price: z.object({ amount: z.number(), currency: z.string() }),
  duration_min: z.number().int().positive(),
  departure_at: z.string(),
  arrival_at: z.string(),
  legs: z.array(z.object({
    from: z.string(),
    to: z.string(),
    segments: z.array(z.object({ voyage_no: z.string() })).min(1),
  })).min(1),
});

const searchOutputSchema = z.object({
  offers: z.array(offerSchema),
});

type McpCall = {
  arguments: string;
  name: string;
  output: string;
  serverLabel: string;
};

const readDate = (): string => {
  const dateIndex = process.argv.indexOf('--date');
  const date = process.argv[dateIndex + 1];

  if (dateIndex < 0 || !date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new Error('Укажите дату: --date YYYY-MM-DD.');
  }

  const departureDate = new Date(`${date}T23:59:59Z`);
  if (Number.isNaN(departureDate.getTime()) || departureDate <= new Date()) {
    throw new Error('Дата поездки должна оставаться будущей.');
  }

  return date;
};

const loadEnvironment = (): void => {
  if (!process.env.OPENAI_API_KEY && existsSync('.env')) loadEnvFile('.env');
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('Не настроен OPENAI_API_KEY. Capture не запускался.');
  }
};

const findMcpCalls = (responses: readonly ModelResponse[]): McpCall[] => {
  const calls: McpCall[] = [];

  for (const response of responses) {
    for (const item of response.output) {
      if (item.type !== 'hosted_tool_call') continue;
      if (item.providerData?.type !== 'mcp_call') continue;

      calls.push({
        arguments: String(item.providerData.arguments ?? ''),
        name: String(item.providerData.name ?? ''),
        output: typeof item.output === 'string' ? item.output : '',
        serverLabel: String(item.providerData.server_label ?? ''),
      });
    }
  }

  return calls;
};

const buildPrompt = (date: string): string => `
Москва → Санкт-Петербург, дата поездки ${date}.
Нужно успеть не позднее 15:00 на Московский вокзал, чтобы к 17:00 быть на
«Река Фест Dark Edition» в BASE SPb, Кондратьевский проспект, 44.
Исходный приоритет — сэкономить. Выбери до трёх фактически найденных вариантов:
дешёвый ночной, практичный дневной и быстрый дневной, если они различаются.
Ночным считаем отправление 00:00–05:59. Не придумывай отсутствующие варианты.
В subtitle каждого маршрута укажи номер поезда, станции и длительность из Tutu.
`.trim();

const isNightDeparture = (departureAt: string): boolean => {
  const hour = Number(departureAt.slice(11, 13));
  return hour >= 0 && hour <= 5;
};

const buildSourceSnapshot = (
  date: string,
  capturedAt: string,
  call: McpCall,
  routeIds: readonly string[],
  recommendedRouteId: string,
) => {
  const output = searchOutputSchema.parse(JSON.parse(call.output));
  const selectedOffers = output.offers.filter((offer) => {
    return routeIds.includes(offer.offer_id);
  });

  if (selectedOffers.length < 2 || selectedOffers.length > 3) {
    throw new Error('Нужно выбрать от двух до трёх фактических предложений.');
  }
  if (selectedOffers.some((offer) => {
    const leg = offer.legs[0];
    return !leg?.to.includes('Московский вокзал') ||
      offer.arrival_at.slice(0, 16) > `${date}T15:00`;
  })) {
    throw new Error('Не все варианты прибывают на Московский вокзал до 15:00.');
  }

  const nightOffers = selectedOffers.filter((offer) => {
    return isNightDeparture(offer.departure_at);
  });
  const dayOffers = selectedOffers.filter((offer) => {
    return !isNightDeparture(offer.departure_at);
  });
  const cheapestAllowed = [...dayOffers].sort((first, second) => {
    return first.price.amount - second.price.amount;
  })[0];

  if (!nightOffers.length || !dayOffers.length) {
    throw new Error('Нет одновременно подходящего ночного и дневного варианта.');
  }
  if (!nightOffers.some((offer) => offer.offer_id === recommendedRouteId) ||
    !cheapestAllowed || cheapestAllowed.offer_id === recommendedRouteId) {
    throw new Error('После запрета ночного рекомендация честно не меняется.');
  }

  return {
    tool: call.name,
    parameters: JSON.parse(call.arguments) as Record<string, unknown>,
    capturedAt,
    offers: selectedOffers.map((offer) => {
      const leg = offer.legs[0]!;
      const segment = leg.segments[0]!;
      return {
        offerId: offer.offer_id,
        trainNumber: segment.voyage_no,
        departureStation: leg.from,
        arrivalStation: leg.to,
        departureAt: offer.departure_at,
        arrivalAt: offer.arrival_at,
        durationMinutes: offer.duration_min,
        price: offer.price,
      };
    }),
  };
};

const capture = async (): Promise<void> => {
  const date = readDate();
  loadEnvironment();

  if (existsSync(SOURCE_SNAPSHOT_PATH)) {
    throw new Error(
      `${SOURCE_SNAPSHOT_PATH} уже существует. ` +
      'Уберите его осознанно перед обновлением.',
    );
  }

  const context: TravelAgentContext = { differenceCalls: 0 };
  const agent = createTravelAgent(
    process.env.TUTU_MCP_URL || DEFAULT_TUTU_MCP_URL,
  );
  const result = await run(agent, buildPrompt(date), {
    context,
    maxTurns: 6,
  });
  const agentResult = parseTravelAgentResult(result.finalOutput);
  const mcpCalls = findMcpCalls(result.rawResponses);
  const searchCalls = mcpCalls.filter((call) => {
    return call.serverLabel === 'tutu' && call.name === 'search_rail';
  });

  if (searchCalls.length !== 1) {
    throw new Error(
      `Ожидался один search_rail, получено: ${searchCalls.length}.`,
    );
  }
  if (context.differenceCalls < 1) {
    throw new Error('TravelAgent не вызвал difference_compare.');
  }
  if (agentResult.status !== 'completed') {
    throw new Error(`TravelAgent завершил capture со статусом ${agentResult.status}.`);
  }
  if (!agentResult.widgetState.recommendation) {
    throw new Error('TravelAgent не вернул рекомендацию.');
  }

  const capturedAt = new Date().toISOString();
  const sourceSnapshot = buildSourceSnapshot(
    date,
    capturedAt,
    searchCalls[0]!,
    agentResult.widgetState.routes.map((route) => route.id),
    agentResult.widgetState.recommendation.routeId,
  );

  mkdirSync('snapshots', { recursive: true });
  writeFileSync(
    SOURCE_SNAPSHOT_PATH,
    `${JSON.stringify(sourceSnapshot, null, 2)}\n`,
    { encoding: 'utf8', flag: 'wx', mode: 0o600 },
  );

  console.log(`Capture сохранён в ${SOURCE_SNAPSHOT_PATH}.`);
};

capture().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Capture остановлен: ${message}`);
  process.exitCode = 1;
});
