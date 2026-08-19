import type { TutuDiffWidgetElement } from "../components/tutu-diff-widget";
import type { TripWidgetState } from "../domain/trip-widget-state";
import type { PresentationStep } from '../scenario/presentation-scenario';

export type MountTutuDiffWidgetOptions = {
  target?: Element;
  open?: boolean;
  sessionState?: TripWidgetState;
  theme?: string;
  position?: "bottom-right" | "bottom-left" | "inline";
  layout?: 'compact' | 'presentation';
  experience?: 'live' | 'scenario';
  presentationStep?: PresentationStep;
};

export type TutuDiffWidgetGlobal = {
  define: (tagName?: string) => void;
  mount: (options?: MountTutuDiffWidgetOptions) => TutuDiffWidgetElement;
  tagName: string;
};
