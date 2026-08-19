import type { MountTutuDiffWidgetOptions } from "./types/public";
import { PRESENTATION_STEPS } from './scenario/presentation-scenario';

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
    ...(script.dataset.layout === 'presentation'
      ? { layout: 'presentation' as const }
      : {}),
    ...(script.dataset.experience === 'scenario'
      ? { experience: 'scenario' as const }
      : {}),
    ...(PRESENTATION_STEPS.includes(
      script.dataset.presentationStep as (typeof PRESENTATION_STEPS)[number],
    ) ? {
      presentationStep: script.dataset.presentationStep as
        (typeof PRESENTATION_STEPS)[number],
    } : {}),
    ...(target ? { target } : {})
  };
  const module = await import(/* @vite-ignore */ moduleUrl);
  module.mountTutuDiffWidget(options);
})();
