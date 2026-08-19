import type { TutuDiffWidgetElement } from "../components/tutu-diff-widget";
import type { TripWidgetState } from "../domain/trip-widget-state";

export type MountTutuDiffWidgetOptions = {
  target?: Element;
  open?: boolean;
  sessionState?: TripWidgetState;
  theme?: string;
  position?: "bottom-right" | "bottom-left" | "inline";
};

export type TutuDiffWidgetGlobal = {
  define: (tagName?: string) => void;
  mount: (options?: MountTutuDiffWidgetOptions) => TutuDiffWidgetElement;
  tagName: string;
};
