import { createActor, type AnyActorLogic } from "xstate";
import type { TripWidgetState } from "../../domain/trip-widget-state";
import type { TravelRunSseEvent, TravelRunStatus } from "../../shared/travel-contracts";
import { travelRunMachine, type TravelRunMachineEvent } from "./travel-run.machine";

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
  actor: TravelRunActor;
  events: SequencedTravelRunEvent[];
  subscribers: Set<TravelRunSubscriber>;
  state: TripWidgetState | null;
};

function isTravelRunStatus(value: unknown): value is TravelRunStatus {
  return value === "running"
    || value === "waitingForUser"
    || value === "completed"
    || value === "failed";
}

export type TravelRunSnapshot = {
  id: string;
  status: TravelRunStatus;
  state: TripWidgetState | null;
};

export type TravelRunSubscription = {
  history: readonly SequencedTravelRunEvent[];
  unsubscribe: () => void;
};

export class TravelRunStore {
  readonly #runs = new Map<string, StoredTravelRun>();

  create(): string {
    const id = crypto.randomUUID();
    // XState v6 alpha's ActorLogic validator is stricter than its machine return type
    // under exactOptionalPropertyTypes. Keep the compatibility cast inside runtime.
    const actor = createActor(travelRunMachine as unknown as AnyActorLogic) as unknown as TravelRunActor;
    actor.start();
    const run: StoredTravelRun = {
      id,
      actor,
      events: [],
      subscribers: new Set(),
      state: null
    };
    this.#runs.set(id, run);
    return id;
  }

  has(id: string): boolean {
    return this.#runs.has(id);
  }

  snapshot(id: string): TravelRunSnapshot | undefined {
    const run = this.#runs.get(id);
    if (!run) return undefined;

    const value = run.actor.getSnapshot().value;
    if (!isTravelRunStatus(value)) return undefined;

    return { id: run.id, status: value, state: run.state };
  }

  setState(id: string, state: TripWidgetState): void {
    const run = this.#require(id);
    run.state = state;
  }

  transition(id: string, event: TravelRunMachineEvent["type"]): void {
    this.#require(id).actor.send({ type: event });
  }

  publish(id: string, event: TravelRunSseEvent): void {
    const run = this.#require(id);
    const sequenced = { id: run.events.length + 1, event };
    run.events.push(sequenced);
    for (const subscriber of run.subscribers) subscriber(sequenced);
  }

  subscribe(id: string, subscriber: TravelRunSubscriber): TravelRunSubscription | undefined {
    const run = this.#runs.get(id);
    if (!run) return undefined;
    run.subscribers.add(subscriber);
    return {
      history: [...run.events],
      unsubscribe: () => {
        run.subscribers.delete(subscriber);
      }
    };
  }

  #require(id: string): StoredTravelRun {
    const run = this.#runs.get(id);
    if (!run) throw new Error(`Unknown TravelRun: ${id}`);
    return run;
  }
}

export const travelRunStore = new TravelRunStore();
