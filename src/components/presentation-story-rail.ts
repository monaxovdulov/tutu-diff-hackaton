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
    nav { display: flex; gap: 6px; overflow-x: auto; }
    button { align-items: center; background: #f4e9e4; border: 0; border-radius: 999px; color: #786b66; cursor: pointer; display: inline-flex; flex: 0 0 30px; font: inherit; height: 30px; justify-content: center; padding: 0; }
    button[aria-current='step'] { background: #292522; color: #fff; flex-basis: auto; font-weight: 720; gap: 6px; padding: 0 11px; }
    .number { font-size: 10px; }
    .label { display: none; font-size: 11px; white-space: nowrap; }
    button[aria-current='step'] .label { display: inline; }
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
