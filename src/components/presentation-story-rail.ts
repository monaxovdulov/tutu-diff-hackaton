import { css, html, LitElement, type TemplateResult } from 'lit';
import {
  PRESENTATION_STEP_LABELS,
  PRESENTATION_STEPS,
  type PresentationStep,
} from '../scenario/presentation-scenario';

export class PresentationStoryRailElement extends LitElement {
  static override properties = {
    step: { type: String },
  };

  static override styles = css`
    :host { display: block; }
    nav { display: grid; gap: 4px; }
    button { align-items: center; background: transparent; border: 0; border-radius: 14px; color: #786b66; cursor: pointer; display: grid; font: inherit; gap: 12px; grid-template-columns: 34px minmax(0, 1fr); min-height: 48px; padding: 0 12px; text-align: left; width: 100%; }
    button:hover { background: rgba(255, 255, 255, .55); }
    button[aria-current='step'] { background: #fff; box-shadow: 0 8px 24px rgba(72, 38, 26, .08); color: #292522; font-weight: 720; }
    .number { color: #b26958; font-size: 11px; letter-spacing: .08em; }
    .label { font-size: 14px; }
    @media (max-width: 760px) {
      nav { display: flex; overflow-x: auto; }
      button { flex: 0 0 auto; grid-template-columns: auto auto; min-height: 40px; width: auto; }
    }
  `;

  step: PresentationStep = 'difference';

  protected override render(): TemplateResult {
    return html`<nav aria-label="Шаги сценария">
      ${PRESENTATION_STEPS.map((step, index) => html`
        <button
          type="button"
          aria-current=${this.step === step ? 'step' : 'false'}
          @click=${() => this._select(step)}
        >
          <span class="number">0${index + 1}</span>
          <span class="label">${PRESENTATION_STEP_LABELS[step]}</span>
        </button>
      `)}
    </nav>`;
  }

  private _select(step: PresentationStep): void {
    this.dispatchEvent(new CustomEvent('tutu-presentation-step', {
      detail: { step },
      bubbles: true,
      composed: true,
    }));
  }
}

if (!customElements.get('presentation-story-rail')) {
  customElements.define(
    'presentation-story-rail',
    PresentationStoryRailElement,
  );
}

declare global {
  interface HTMLElementTagNameMap {
    'presentation-story-rail': PresentationStoryRailElement;
  }
}
