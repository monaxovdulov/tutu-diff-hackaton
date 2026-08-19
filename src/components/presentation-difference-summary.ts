import { css, html, LitElement, type TemplateResult } from 'lit';

export class PresentationDifferenceSummaryElement extends LitElement {
  static override properties = {
    priceDelta: { type: Number },
    durationDeltaMinutes: { type: Number },
    totalCostDeltaMin: { type: Number },
    totalCostDeltaMax: { type: Number },
  };

  static override styles = css`
    :host { display: block; }
    section { background: #292522; border-radius: 18px; color: #fff; display: grid; gap: 13px; padding: 17px; }
    h3 { font-size: 19px; letter-spacing: -.03em; margin: 0; }
    p { color: #d8ccc7; font-size: 13px; line-height: 1.4; margin: 6px 0 0; }
    .facts { display: grid; gap: 8px; grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .fact { background: rgba(255, 255, 255, .08); border-radius: 12px; padding: 11px; }
    .fact:last-child { grid-column: 1 / -1; }
    strong { display: block; font-size: 18px; font-variant-numeric: tabular-nums; }
    span { color: #d8ccc7; display: block; font-size: 11px; margin-top: 4px; }
  `;

  priceDelta = 0;
  durationDeltaMinutes = 0;
  totalCostDeltaMin = 0;
  totalCostDeltaMax = 0;

  protected override render(): TemplateResult {
    const price = this._formatPrice(Math.abs(this.priceDelta));
    const duration = Math.abs(this.durationDeltaMinutes);
    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;
    const totalMin = this._formatSignedPrice(this.totalCostDeltaMin);
    const totalMax = this._formatSignedPrice(this.totalCostDeltaMax);

    return html`<section aria-label="Реальная разница">
      <div><h3>Реальная разница</h3><p>Дневной вариант против дешёвого ночного</p></div>
      <div class="facts">
        <div class="fact"><strong>+${price}</strong><span>к цене билета</span></div>
        <div class="fact"><strong>−${hours} ч ${minutes} мин</strong><span>в дороге</span></div>
        <div class="fact"><strong>${totalMin}…${totalMax}</strong><span>разница полной стоимости*</span></div>
      </div>
    </section>`;
  }

  private _formatPrice(value: number): string {
    return `${new Intl.NumberFormat('ru-RU', {
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
    }).format(value)} ₽`;
  }

  private _formatSignedPrice(value: number): string {
    const prefix = value >= 0 ? '+' : '−';
    return `${prefix}${this._formatPrice(Math.abs(value))}`;
  }
}

if (!customElements.get('presentation-difference-summary')) {
  customElements.define(
    'presentation-difference-summary',
    PresentationDifferenceSummaryElement,
  );
}

declare global {
  interface HTMLElementTagNameMap {
    'presentation-difference-summary': PresentationDifferenceSummaryElement;
  }
}
