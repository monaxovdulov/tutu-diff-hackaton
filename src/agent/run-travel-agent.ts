import { run } from "@openai/agents";
import type { TravelAgentResult } from "../shared/travel-contracts";
import { DEFAULT_TUTU_MCP_URL } from "../tools/tutu-mcp";
import type { TravelAgentContext } from "../tools/difference-tool";
import { parseTravelAgentResult } from "./schemas";
import { createTravelAgent } from "./travel-agent";

export async function runTravelAgent(message: string): Promise<TravelAgentResult> {
  if (!process.env.OPENAI_API_KEY) throw new Error("На сервере не настроен OPENAI_API_KEY.");

  const context: TravelAgentContext = { differenceCalls: 0 };
  const agent = createTravelAgent(process.env.TUTU_MCP_URL || DEFAULT_TUTU_MCP_URL);
  const result = await run(agent, message, {
    context,
    maxTurns: 6
  });
  const parsed = parseTravelAgentResult(result.finalOutput);

  if (parsed.status === "completed") {
    const raw = JSON.stringify(result.rawResponses);
    if (!raw.includes('"type":"mcp_call"') || !raw.includes('"server_label":"tutu"')) {
      throw new Error("TravelAgent завершился без реального вызова Tutu MCP.");
    }
    if (context.differenceCalls < 1) {
      throw new Error("TravelAgent завершился без вызова difference.compare.");
    }
  }

  return parsed;
}
