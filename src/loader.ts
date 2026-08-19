import type { MountTutuDiffWidgetOptions } from "./types/public";

void (async () => {
  if (typeof document === "undefined") return;
  const script = document.currentScript instanceof HTMLScriptElement
    ? document.currentScript
    : document.querySelector<HTMLScriptElement>("script[data-tutu-diff-widget-loader]");
  if (!script) return;
  const moduleUrl = new URL("./tutu-diff-widget.esm.js", script.src || window.location.href).href;
  const targetSelector = script.dataset.targetSelector || script.dataset.target || "";
  const target = targetSelector ? document.querySelector(targetSelector) : document.body;
  const options: MountTutuDiffWidgetOptions = {
    ...(script.dataset.open === "true" ? { open: true } : {}),
    ...(script.dataset.theme ? { theme: script.dataset.theme } : {}),
    ...(script.dataset.position === "bottom-left" || script.dataset.position === "inline" ? { position: script.dataset.position } : {}),
    ...(target ? { target } : {})
  };
  const module = await import(/* @vite-ignore */ moduleUrl);
  module.mountTutuDiffWidget(options);
})();
