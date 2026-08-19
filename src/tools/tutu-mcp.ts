import { hostedMcpTool } from "@openai/agents";
import type { TravelAgentContext } from "./difference-tool";

export const DEFAULT_TUTU_MCP_URL = "https://mcp.tutu.ru/mcp";

export function createTutuMcpTool(serverUrl: string) {
  return hostedMcpTool<TravelAgentContext>({
    serverLabel: "tutu",
    serverDescription: "Official Tutu travel search. Use search_rail once for the requested rail route and date.",
    serverUrl,
    allowedTools: ["search_rail"],
    requireApproval: "never"
  });
}

