import { createActor, type AnyActorLogic } from "xstate";
import type { TripWidgetState } from "../../domain/trip-widget-state";
import type { TravelRunSseEvent, TravelRunStatus } from "../../shared/travel-contracts";
import { travelRunMachine } from "./travel-run.machine";

export type SequencedTravelRunEvent = {
  id: number;
  event: TravelRunSseEvent;
};

type TravelRunSubscriber = (event: SequencedTravelRunEvent) => void;

type TravelRunActor = {
  start: () => unknown;
  send: (event: { type: string }) => void;
  getSnapshot: () => { value: unknown };
};

type StoredTravelRun = {
  id: string;
  message: string;
  actor: TravelRunActor;
  events: SequencedTravelRunEvent[];
  subscribers: Set<TravelRunSubscriber>;
  state: TripWidgetState | null;
};

export class TravelRunStore {
  readonly #runs = new Map<string, StoredTravelRun>();

  create(message: string): StoredTravelRun {
    const id = crypto.randomUUID();
    // XState v6 alpha's ActorLogic validator is stricter than its machine return type
    // under exactOptionalPropertyTypes. Keep the compatibility cast inside runtime.
    const actor = createActor(travelRunMachine as unknown as AnyActorLogic) as unknown as TravelRunActor;
    actor.start();
    const run: StoredTravelRun = { id, message, actor, events: [], subscribers: new Set(), state: null };
    this.#runs.set(id, run);
    return run;
  }

  get(id: string): StoredTravelRun | undefined {
    return this.#runs.get(id);
  }

  status(id: string): TravelRunStatus | undefined {
    const value = this.#runs.get(id)?.actor.getSnapshot().value;
    return typeof value === "string" ? value as TravelRunStatus : undefined;
  }

  setState(id: string, state: TripWidgetState): void {
    const run = this.#require(id);
    run.state = state;
  }

  transition(id: string, event: "NEEDS_INPUT" | "COMPLETE" | "FAIL"): void {
    this.#require(id).actor.send({ type: event });
  }

  publish(id: string, event: TravelRunSseEvent): void {
    const run = this.#require(id);
    const sequenced = { id: run.events.length + 1, event };
    run.events.push(sequenced);
    for (const subscriber of run.subscribers) subscriber(sequenced);
  }

  subscribe(id: string, subscriber: TravelRunSubscriber): { history: readonly SequencedTravelRunEvent[]; unsubscribe: () => void } | undefined {
    const run = this.#runs.get(id);
    if (!run) return undefined;
    run.subscribers.add(subscriber);
    return {
      history: [...run.events],
      unsubscribe: () => run.subscribers.delete(subscriber)
    };
  }

  #require(id: string): StoredTravelRun {
    const run = this.#runs.get(id);
    if (!run) throw new Error(`Unknown TravelRun: ${id}`);
    return run;
  }
}

export const travelRunStore = new TravelRunStore();
