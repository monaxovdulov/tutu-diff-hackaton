import { tool } from "@openai/agents";
import { z } from "zod";
import { difference } from '../domain/difference';

export { difference } from '../domain/difference';

export type TravelAgentContext = {
  differenceCalls: number;
};

const comparisonInputSchema = z.object({
  first: z.object({
    id: z.string(),
    price: z.number().nonnegative(),
    durationMinutes: z.number().int().positive(),
    additionalCostMin: z.number().nonnegative().optional(),
    additionalCostMax: z.number().nonnegative().optional()
  }),
  second: z.object({
    id: z.string(),
    price: z.number().nonnegative(),
    durationMinutes: z.number().int().positive(),
    additionalCostMin: z.number().nonnegative().optional(),
    additionalCostMax: z.number().nonnegative().optional()
  })
});

const comparisonOutputSchema = z.object({
  firstId: z.string(),
  secondId: z.string(),
  priceDelta: z.number(),
  durationDeltaMinutes: z.number(),
  totalCostDeltaMin: z.number(),
  totalCostDeltaMax: z.number(),
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
    const comparison = difference.compare(input.first, input.second);
    return {
      firstId: input.first.id,
      secondId: input.second.id,
      ...comparison,
      cheaperRouteId: input.first.price <= input.second.price ? input.first.id : input.second.id,
      fasterRouteId: input.first.durationMinutes <= input.second.durationMinutes ? input.first.id : input.second.id
    };
  }
});
