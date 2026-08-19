import { LitElement, css, html, nothing, type PropertyValues, type TemplateResult } from "lit";
import type { TripImpact, TripRoute } from "../domain/trip-widget-state";
import { widgetIcon } from "../ui/icons";

export class TripOptionCardElement extends LitElement {
  static override properties = {
    route: { attribute: false },
    selected: { type: Boolean, reflect: true },
    loading: { type: Boolean, reflect: true },
    disabled: { type: Boolean, reflect: true },
    density: { type: String, reflect: true }
  };

  static override styles = css`
    :host { display: block; min-width: 0; }
    * { box-sizing: border-box; }
    button { font: inherit; }
    .card { background: #fff; border: 1px solid var(--sw-color-border-soft); border-radius: 18px; color: var(--sw-color-text-primary); cursor: pointer; display: block; padding: 15px 16px; text-align: left; transition: border-color 140ms ease, box-shadow 140ms ease, opacity 140ms ease; width: 100%; }
    .card:hover { border-color: color-mix(in srgb, var(--sw-color-accent) 55%, var(--sw-color-border-soft)); box-shadow: 0 9px 24px rgba(104, 60, 42, .08); }
    :host([selected]) .card { border-color: var(--sw-color-accent); box-shadow: 0 0 0 2px color-mix(in srgb, var(--sw-color-accent) 18%, transparent); }
    :host([disabled]) .card { cursor: default; opacity: .58; }
    .top, .times, .impact { align-items: center; display: flex; }
    .top { gap: 12px; justify-content: space-between; }
    h3 { font-size: 16px; margin: 0; }
    .price { font-size: 17px; font-weight: 720; white-space: nowrap; }
    .times { font-size: 20px; font-variant-numeric: tabular-nums; font-weight: 680; gap: 9px; margin-top: 9px; }
    .arrow { color: var(--sw-color-text-muted); font-weight: 400; }
    .subtitle { color: var(--sw-color-text-secondary); font-size: 13px; margin: 4px 0 0; min-height: 18px; }
    .impacts { border-top: 1px solid var(--sw-color-border-soft); display: grid; gap: 7px; margin-top: 12px; padding-top: 11px; }
    .impact { color: var(--sw-color-text-secondary); font-size: 13px; gap: 8px; line-height: 1.35; }
    .impact--warning { color: #9a4e36; }
    .impact--positive { color: #397258; }
    .icon { display: inline-flex; flex: 0 0 auto; }
    .skeletons { display: grid; gap: 7px; margin-top: 12px; }
    .skeleton { animation: pulse 1.3s ease-in-out infinite; background: #f2e9e5; border-radius: 999px; height: 8px; width: 72%; }
    .skeleton:last-child { width: 48%; }
    .note { color: #397258; font-size: 13px; font-weight: 650; margin: 10px 0 0; }
    :host([density="minimal"]) .card { border-radius: 16px; padding: 13px 14px; }
    :host([density="minimal"]) h3 { font-size: 15px; }
    :host([density="minimal"]) .price { font-size: 16px; }
    :host([density="minimal"]) .times { font-size: 18px; margin-top: 8px; }
    :host([density="minimal"]) .subtitle { font-size: 12px; }
    @keyframes pulse { 50% { opacity: .42; } }
    @media (prefers-reduced-motion: reduce) { .skeleton { animation: none; } }
  `;

  route: TripRoute | null = null;
  selected = false;
  loading = false;
  disabled = false;
  density: 'regular' | 'minimal' = 'regular';

  protected override render(): TemplateResult | typeof nothing {
    if (!this.route) return nothing;
    const status = this.loading ? "enriching" : this.route.analysisStatus;
    const showDetails = this.density !== 'minimal';
    return html`
      <button class="card" type="button" ?disabled=${this.disabled} aria-pressed=${String(this.selected)} @click=${this._select}>
        <div class="top"><h3>${this.route.title}</h3><span class="price">${formatPrice(this.route.price)}</span></div>
        <div class="times"><span>${this.route.departureTime}</span><span class="arrow" aria-hidden="true">→</span><span>${this.route.arrivalTime}</span></div>
        <p class="subtitle">${this.route.subtitle}</p>
        ${status === "enriching" ? html`<div class="skeletons" aria-label="Дополняем детали"><span class="skeleton"></span><span class="skeleton"></span></div>` : nothing}
        ${showDetails && status === "ready" && this.route.impacts.length ? html`<div class="impacts">${this.route.impacts.map((impact) => this._renderImpact(impact))}</div>` : nothing}
        ${showDetails && this.route.recommendationNote ? html`<p class="note">${this.route.recommendationNote}</p>` : nothing}
      </button>
    `;
  }

  protected override updated(changed: PropertyValues): void {
    if (changed.has("route")) this.setAttribute("data-route-id", this.route?.id ?? "");
  }

  private _renderImpact(impact: TripImpact): TemplateResult {
    return html`<div class="impact impact--${impact.tone}"><span class="icon" aria-hidden="true">${widgetIcon(impact.icon, 16)}</span><span>${impact.text}</span></div>`;
  }

  private _select = (): void => {
    if (!this.route || this.disabled) return;
    this.dispatchEvent(new CustomEvent("tutu-route-select", {
      detail: { routeId: this.route.id },
      bubbles: true,
      composed: true
    }));
  };
}

function formatPrice(price: number): string {
  return `${new Intl.NumberFormat("ru-RU").format(price)} ₽`;
}

if (!customElements.get("trip-option-card")) customElements.define("trip-option-card", TripOptionCardElement);

declare global {
  interface HTMLElementTagNameMap { "trip-option-card": TripOptionCardElement; }
}
