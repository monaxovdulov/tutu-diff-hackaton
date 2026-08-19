export type DifferenceCandidate = {
  price: number;
  durationMinutes: number;
  additionalCostMin?: number | undefined;
  additionalCostMax?: number | undefined;
};

export const difference = {
  compare(first: DifferenceCandidate, second: DifferenceCandidate) {
    const firstAdditionalMin = first.additionalCostMin ?? 0;
    const firstAdditionalMax = first.additionalCostMax ?? firstAdditionalMin;
    const secondAdditionalMin = second.additionalCostMin ?? 0;
    const secondAdditionalMax = second.additionalCostMax ?? secondAdditionalMin;

    return {
      priceDelta: second.price - first.price,
      durationDeltaMinutes: second.durationMinutes - first.durationMinutes,
      totalCostDeltaMin:
        second.price + secondAdditionalMin - first.price - firstAdditionalMax,
      totalCostDeltaMax:
        second.price + secondAdditionalMax - first.price - firstAdditionalMin,
    };
  },
};
