import { tool } from "@openai/agents";
import { z } from "zod";

export type TravelAgentContext = {
  differenceCalls: number;
};

const comparisonInputSchema = z.object({
  first: z.object({
    id: z.string(),
    price: z.number().nonnegative(),
    durationMinutes: z.number().int().positive()
  }),
  second: z.object({
    id: z.string(),
    price: z.number().nonnegative(),
    durationMinutes: z.number().int().positive()
  })
});

const comparisonOutputSchema = z.object({
  firstId: z.string(),
  secondId: z.string(),
  priceDelta: z.number(),
  durationDeltaMinutes: z.number(),
  cheaperRouteId: z.string(),
  fasterRouteId: z.string()
});

export const differenceCompareTool = tool<typeof comparisonInputSchema, TravelAgentContext, unknown, typeof comparisonOutputSchema>({
  name: "difference_compare",
  description: "Deterministically compares price and travel duration for two normalized travel candidates. Call it before making a recommendation.",
  parameters: comparisonInputSchema,
  outputSchema: comparisonOutputSchema,
  execute: (input, runContext) => {
    if (runContext) runContext.context.differenceCalls += 1;
    return {
      firstId: input.first.id,
      secondId: input.second.id,
      priceDelta: input.second.price - input.first.price,
      durationDeltaMinutes: input.second.durationMinutes - input.first.durationMinutes,
      cheaperRouteId: input.first.price <= input.second.price ? input.first.id : input.second.id,
      fasterRouteId: input.first.durationMinutes <= input.second.durationMinutes ? input.first.id : input.second.id
    };
  }
});

export const difference = {
  compare(first: { price: number; durationMinutes: number }, second: { price: number; durationMinutes: number }) {
    return {
      priceDelta: second.price - first.price,
      durationDeltaMinutes: second.durationMinutes - first.durationMinutes
    };
  }
};

