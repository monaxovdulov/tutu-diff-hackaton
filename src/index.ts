import { TutuDiffWidgetElement, TUTU_DIFF_WIDGET_TAG_NAME } from "./components/tutu-diff-widget";
import type { MountTutuDiffWidgetOptions, TutuDiffWidgetGlobal } from "./types/public";

export { TutuDiffWidgetElement, TUTU_DIFF_WIDGET_TAG_NAME };
export { reduceTripWidgetState } from "./domain/trip-widget-state";
export type * from "./domain/trip-widget-state";
export type * from "./types/public";

export function defineTutuDiffWidget(tagName = TUTU_DIFF_WIDGET_TAG_NAME): void {
  if (typeof window === "undefined" || !window.customElements) return;
  if (!window.customElements.get(tagName)) window.customElements.define(tagName, TutuDiffWidgetElement);
}

export function mountTutuDiffWidget(options: MountTutuDiffWidgetOptions = {}): TutuDiffWidgetElement {
  if (typeof document === "undefined") throw new Error("mountTutuDiffWidget requires a browser document");
  defineTutuDiffWidget();
  const element = document.createElement(TUTU_DIFF_WIDGET_TAG_NAME) as TutuDiffWidgetElement;
  if (options.sessionState) element.sessionState = options.sessionState;
  if (options.open) element.setAttribute("open", "");
  if (options.theme) element.setAttribute("theme", options.theme);
  if (options.position) element.setAttribute("position", options.position);
  if (options.layout) element.layout = options.layout;
  if (options.experience) element.experience = options.experience;
  if (options.presentationStep) {
    element.presentationStep = options.presentationStep;
  }
  (options.target ?? document.body).appendChild(element);
  return element;
}

declare global {
  interface Window { TutuDiffWidget?: TutuDiffWidgetGlobal; }
  interface HTMLElementTagNameMap { "tutu-diff-widget": TutuDiffWidgetElement; }
}
