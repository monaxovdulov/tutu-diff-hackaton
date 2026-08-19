import { readFileSync } from "node:fs";
import { Agent } from "@openai/agents";
import { travelAgentOutputSchema } from "./schemas";
import { differenceCompareTool, type TravelAgentContext } from "../tools/difference-tool";
import { createTutuMcpTool } from "../tools/tutu-mcp";

const instructions = readFileSync(new URL("./travel-agent.prompt.md", import.meta.url), "utf8").trim();

export function createTravelAgent(tutuMcpUrl: string) {
  return new Agent<TravelAgentContext, typeof travelAgentOutputSchema>({
    name: "TravelAgent",
    model: "gpt-5.6",
    instructions,
    tools: [createTutuMcpTool(tutuMcpUrl), differenceCompareTool],
    outputType: travelAgentOutputSchema,
    modelSettings: {
      toolChoice: "auto"
    }
  });
}

