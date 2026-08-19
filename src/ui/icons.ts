import { svg, type TemplateResult } from "lit";

export function widgetIcon(name: string, size = 20): TemplateResult {
  const paths: Record<string, TemplateResult> = {
    message: svg`<path d="M5 5h14v10H9l-4 4V5Z"/>`,
    brand: svg`<path d="M5 12h14M12 5l7 7-7 7"/>`,
    minus: svg`<path d="M5 12h14"/>`,
    close: svg`<path d="m6 6 12 12M18 6 6 18"/>`,
    send: svg`<path d="m4 12 16-8-5 16-3-6-8-2Zm8 2 8-10"/>`,
    metro: svg`<path d="M7 17h10M8 20l2-3m6 0 2 3M7 4h10l1 10-2 3H8l-2-3L7 4Zm1 7h8"/>`,
    taxi: svg`<path d="M5 11 7 6h10l2 5M4 11h16v6H4v-6Zm2 6v2m12-2v2"/>`,
    day: svg`<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5M17.5 17.5 19 19M19 5l-1.5 1.5M6.5 17.5 5 19"/>`,
    comfort: svg`<path d="M5 15V9a3 3 0 0 1 3-3h8a3 3 0 0 1 3 3v6M3 13h18v5H3v-5Zm3 5v2m12-2v2"/>`,
    time: svg`<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>`,
    info: svg`<circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-10h.01"/>`,
    back: svg`<path d="m15 18-6-6 6-6"/>`
  };
  return svg`<svg width=${size} height=${size} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] ?? paths.info}</svg>`;
}
