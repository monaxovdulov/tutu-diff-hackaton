import { createMachine } from "xstate";

export type TravelRunMachineEvent =
  | { type: "NEEDS_INPUT" }
  | { type: "COMPLETE" }
  | { type: "FAIL" };

export const travelRunMachine = createMachine({
  id: "travelRun",
  initial: "running",
  states: {
    running: {
      on: {
        NEEDS_INPUT: { target: "waitingForUser" },
        COMPLETE: { target: "completed" },
        FAIL: { target: "failed" }
      }
    },
    waitingForUser: { type: "final" },
    completed: { type: "final" },
    failed: { type: "final" }
  }
});
