import { css, html, LitElement, type TemplateResult } from 'lit';
import {
  PRESENTATION_STEP_LABELS,
  presentationScenario,
  type PresentationStep,
} from '../scenario/presentation-scenario';
import './presentation-difference-summary';

type Experience = 'live' | 'scenario';

type StepCopy = {
  title: string;
  text: string;
  facts: readonly string[];
};

const STEP_COPY: Record<PresentationStep, StepCopy> = {
  request: {
    title: 'Запрос зафиксирован на лендинге',
    text: 'Виджет показывает только диалог. Маршрут, событие и источник данных лежат рядом, чтобы не повторяться в панели.',
    facts: ['Москва → Санкт-Петербург', '5 сентября 2026', 'Река Фест · 17:00'],
  },
  options: {
    title: 'Сравниваем два найденных варианта',
    text: 'В панели остаются карточки маршрутов. Здесь объясняется, почему эти карточки вообще сравниваются.',
    facts: ['100С · 01:35 → 10:46', '742У · 06:00 → 11:45', 'Источник: сохранённый Tutu MCP snapshot'],
  },
  impacts: {
    title: 'Последствия вынесены из виджета',
    text: 'Карточка не превращается в отчёт. Длинные пояснения про ночь, такси и событие остаются в лендинге.',
    facts: ['Ночное отправление: 01:35', 'Дневной поезд быстрее на 3 ч 26 мин', `Такси до BASE SPb: ${presentationScenario.taxiEstimate}`],
  },
  difference: {
    title: 'Реальная разница считается отдельно',
    text: 'Виджет показывает результат выбора. Числа и provenance находятся здесь, рядом с описанием сценария.',
    facts: ['Разница билета: +414,81 ₽', 'Разница времени: −3 ч 26 мин', 'Такси — оценка Туту Разницы'],
  },
  constraint: {
    title: 'Новое условие меняет список',
    text: 'Пользователь добавил ограничение «не отправляться ночью». Ночной поезд исключается без нового MCP-запроса.',
    facts: ['Исключён 100С', 'Остаётся дневная «Аврора» 742У', 'Пересчёт идёт в коде сценария'],
  },
  recommendation: {
    title: 'Рекомендация остаётся короткой',
    text: 'Финальный ответ в виджете сведен к действию. Обоснование уже собрано в карточках лендинга.',
    facts: ['Рекомендован 742У', 'Условие «не ночью» выполнено', 'Кнопка ведёт в режим «Свой запрос»'],
  },
};

export class PresentationLandingCardElement extends LitElement {
  static override properties = {
    step: { type: String },
    experience: { type: String },
  };

  static override styles = css`
    :host { display: block; }
    .shell { display: grid; gap: 12px; margin-top: 22px; }
    .card, .case-card { background: rgba(255,255,255,.66); border: 1px solid rgba(71,45,35,.1); border-radius: 24px; box-shadow: 0 18px 50px rgba(72,38,26,.07); padding: 18px; }
    .case-card { display: grid; gap: 12px; }
    .kicker { color: #a45a49; display: block; font-size: 10px; font-weight: 780; letter-spacing: .1em; margin-bottom: 7px; text-transform: uppercase; }
    h2, h3, p { margin: 0; }
    h2 { color: #292522; font-size: 22px; letter-spacing: -.04em; line-height: 1.08; }
    h3 { color: #292522; font-size: 16px; letter-spacing: -.02em; }
    p { color: #645853; font-size: 14px; line-height: 1.48; }
    .meta { display: grid; gap: 7px; }
    .meta-row { align-items: center; display: flex; gap: 8px; }
    .dot { background: #ff765f; border-radius: 50%; height: 7px; width: 7px; }
    .facts { display: flex; flex-wrap: wrap; gap: 7px; list-style: none; margin: 12px 0 0; padding: 0; }
    .facts li { background: #fff; border: 1px solid rgba(71,45,35,.08); border-radius: 999px; color: #5f534e; font-size: 12px; padding: 7px 9px; }
    .split { display: grid; gap: 10px; grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .metric { background: #fff; border: 1px solid rgba(71,45,35,.08); border-radius: 18px; padding: 13px; }
    .metric strong { color: #292522; display: block; font-size: 18px; font-variant-numeric: tabular-nums; }
    .metric span { color: #81736d; display: block; font-size: 11px; line-height: 1.35; margin-top: 4px; }
    .live-list { display: grid; gap: 9px; list-style: none; margin: 14px 0 0; padding: 0; }
    .live-list li { align-items: flex-start; display: grid; gap: 9px; grid-template-columns: 24px minmax(0, 1fr); }
    .live-list b { align-items: center; background: #292522; border-radius: 50%; color: #fff; display: inline-flex; font-size: 11px; height: 24px; justify-content: center; width: 24px; }
    .live-list span { color: #645853; font-size: 13px; line-height: 1.42; }
    presentation-difference-summary { margin-top: 12px; }
    @media (max-width: 760px) { .split { grid-template-columns: 1fr; } }
  `;

  step: PresentationStep = 'difference';
  experience: Experience = 'scenario';

  protected override render(): TemplateResult {
    if (this.experience === 'live') return this._renderLive();

    const copy = STEP_COPY[this.step] ?? STEP_COPY.difference;
    return html`<div class="shell">
      <section class="case-card" aria-label="Контекст сценария">
        <div>
          <span class="kicker">Сценарий жюри</span>
          <h2>${presentationScenario.event.title}</h2>
        </div>
        <div class="meta">
          <p class="meta-row"><span class="dot" aria-hidden="true"></span><span>${presentationScenario.event.time}</span></p>
          <p class="meta-row"><span class="dot" aria-hidden="true"></span><span>${presentationScenario.event.place}</span></p>
          <p class="meta-row"><span class="dot" aria-hidden="true"></span><span>${presentationScenario.provenance}</span></p>
        </div>
      </section>
      <section class="card" aria-label="Пояснение текущего шага">
        <span class="kicker">${PRESENTATION_STEP_LABELS[this.step]}</span>
        <h3>${copy.title}</h3>
        <p>${copy.text}</p>
        <ul class="facts">
          ${copy.facts.map((fact) => html`<li>${fact}</li>`)}
        </ul>
        ${this.step === 'difference' ? html`
          <presentation-difference-summary
            .priceDelta=${presentationScenario.difference.priceDelta}
            .durationDeltaMinutes=${presentationScenario.difference.durationDeltaMinutes}
            .totalCostDeltaMin=${presentationScenario.difference.totalCostDeltaMin}
            .totalCostDeltaMax=${presentationScenario.difference.totalCostDeltaMax}
          ></presentation-difference-summary>
        ` : ''}
      </section>
    </div>`;
  }

  private _renderLive(): TemplateResult {
    return html`<div class="shell">
      <section class="card" aria-label="Как устроен живой запрос">
        <span class="kicker">Свой запрос</span>
        <h2>Виджет остаётся формой, лендинг — объяснением</h2>
        <p>Пользователь вводит маршрут и дату справа. Живой путь через Node API, TravelRun, агента, Tutu MCP и SSE сохранён без изменений.</p>
        <ul class="live-list">
          <li><b>1</b><span>Виджет собирает короткий запрос и отправляет его в существующий frontend client.</span></li>
          <li><b>2</b><span>Backend возвращает прогресс, карточки маршрутов или понятную ошибку.</span></li>
          <li><b>3</b><span>Дополнительные пояснения продукта не повторяются внутри панели.</span></li>
        </ul>
      </section>
    </div>`;
  }
}

if (!customElements.get('presentation-landing-card')) {
  customElements.define('presentation-landing-card', PresentationLandingCardElement);
}

declare global {
  interface HTMLElementTagNameMap {
    'presentation-landing-card': PresentationLandingCardElement;
  }
}
