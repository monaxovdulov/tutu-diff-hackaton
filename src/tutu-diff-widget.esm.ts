import { defineTutuDiffWidget, mountTutuDiffWidget, TUTU_DIFF_WIDGET_TAG_NAME } from "./index";
export * from "./index";

if (typeof window !== "undefined") {
  window.TutuDiffWidget = {
    define: defineTutuDiffWidget,
    mount: mountTutuDiffWidget,
    tagName: TUTU_DIFF_WIDGET_TAG_NAME
  };
  defineTutuDiffWidget();
}
