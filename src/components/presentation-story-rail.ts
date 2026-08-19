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
    nav { display: grid; gap: 6px; grid-template-columns: repeat(6, minmax(0, 1fr)); }
    button { background: transparent; border: 0; border-top: 3px solid #eadbd4; color: #786b66; cursor: pointer; font: inherit; font-size: 12px; padding: 10px 4px 4px; text-align: left; }
    button[aria-current='step'] { border-color: #ff765f; color: #292522; font-weight: 720; }
    .number { display: block; font-size: 10px; margin-bottom: 3px; }
    @media (max-width: 720px) { nav { display: flex; overflow-x: auto; } button { flex: 0 0 128px; } }
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
          ${PRESENTATION_STEP_LABELS[step]}
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
