import { css, html, LitElement, type TemplateResult } from 'lit';
import type { TripRoute } from '../domain/trip-widget-state';
import './trip-option-card';

export class PresentationComparisonBoardElement extends LitElement {
  static override properties = {
    routes: { attribute: false },
    excludedRouteIds: { attribute: false },
    density: { type: String, reflect: true },
  };

  static override styles = css`
    :host { display: block; }
    .board { display: grid; gap: 9px; grid-template-columns: minmax(0, 1fr); }
    .route { min-width: 0; position: relative; }
    .route--excluded { opacity: .48; }
    .excluded { background: #392f2b; border-radius: 999px; color: #fff; font-size: 11px; font-weight: 700; left: 12px; padding: 6px 9px; position: absolute; top: 12px; z-index: 1; }
  `;

  routes: readonly TripRoute[] = [];
  excludedRouteIds: readonly string[] = [];
  density: 'regular' | 'minimal' = 'regular';

  protected override render(): TemplateResult {
    return html`<div class="board">
      ${this.routes.map((route) => {
        const isExcluded = this.excludedRouteIds.includes(route.id);
        return html`<div class="route ${isExcluded ? 'route--excluded' : ''}">
          ${isExcluded ? html`<span class="excluded">Исключён: ночью</span>` : ''}
          <trip-option-card
            .route=${route}
            .selected=${Boolean(route.recommendationNote)}
            .loading=${route.analysisStatus === 'enriching'}
            .disabled=${false}
            .density=${this.density}
          ></trip-option-card>
        </div>`;
      })}
    </div>`;
  }
}

if (!customElements.get('presentation-comparison-board')) {
  customElements.define(
    'presentation-comparison-board',
    PresentationComparisonBoardElement,
  );
}

declare global {
  interface HTMLElementTagNameMap {
    'presentation-comparison-board': PresentationComparisonBoardElement;
  }
}
