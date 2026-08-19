import { LitElement, html, nothing, type TemplateResult } from "lit";
import { repeat } from "lit/directives/repeat.js";
import { getTutuDemoState } from "../fixtures/tutu-demo-states";
import { reduceTripWidgetState, type TripRoute, type TripWidgetEvent, type TripWidgetState } from "../domain/trip-widget-state";
import { startTravelRun } from "../client/travel-api";
import type { TravelRunSseEvent } from "../shared/travel-contracts";
import { messageStyles } from "../styles/message.styles";
import { widgetStyles } from "../styles/widget.styles";
import { widgetIcon } from "../ui/icons";
import {
  getPresentationState,
  presentationScenario,
  type PresentationStep,
} from '../scenario/presentation-scenario';
import "./trip-option-card";
import './presentation-comparison-board';
import './presentation-difference-summary';
import { renderChatItem } from "./widget-message";

export const TUTU_DIFF_WIDGET_TAG_NAME = "tutu-diff-widget";

type IntakePrompt = {
  id: string;
  label: string;
  phrase: string;
};

const INTAKE_PROMPTS: readonly IntakePrompt[] = [
  { id: "budget", label: "Подешевле", phrase: "хочу подешевле" },
  { id: "day", label: "Приехать днём", phrase: "важно приехать днём" },
  { id: "event", label: "После события", phrase: "еду после события" },
  { id: "night", label: "Без ночных пересадок", phrase: "без жёстких ночных пересадок" }
];

export class TutuDiffWidgetElement extends LitElement {
  static override properties = {
    sessionState: { attribute: false },
    layout: { type: String, reflect: true },
    experience: { type: String, reflect: true },
    presentationStep: {
      type: String,
      attribute: 'presentation-step',
      reflect: true,
    },
    _draft: { state: true },
    _intakeOrigin: { state: true },
    _intakeDestination: { state: true },
    _intakeDate: { state: true },
    _selectedIntakePrompts: { state: true },
    _intakeError: { state: true },
    _selectedRouteId: { state: true },
    _expandedRouteId: { state: true },
    _isOpen: { state: true },
    _isMinimized: { state: true }
  };

  static override styles = [widgetStyles, messageStyles];

  static override get observedAttributes(): string[] {
    return [...super.observedAttributes, "open"];
  }

  sessionState: TripWidgetState = getTutuDemoState(1);
  layout: 'compact' | 'presentation' = 'compact';
  experience: 'live' | 'scenario' = 'live';
  presentationStep: PresentationStep = 'difference';
  private _draft = "";
  private _intakeOrigin = "";
  private _intakeDestination = "";
  private _intakeDate = "";
  private _selectedIntakePrompts: string[] = [];
  private _intakeError: string | null = null;
  private _selectedRouteId: string | null = null;
  private _expandedRouteId: string | null = null;
  private _isOpen = false;
  private _isMinimized = false;
  private _travelEvents: EventSource | null = null;
  private _travelRequestGeneration = 0;

  override connectedCallback(): void {
    super.connectedCallback();
    this._isOpen = this.hasAttribute("open");
    this._syncSnapshotUi();
  }

  override disconnectedCallback(): void {
    this._travelEvents?.close();
    this._travelEvents = null;
    super.disconnectedCallback();
  }

  override attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
    super.attributeChangedCallback(name, oldValue, newValue);
    if (name === "open" && oldValue !== newValue) this._isOpen = newValue !== null;
  }

  protected override willUpdate(changed: Map<PropertyKey, unknown>): void {
    if (changed.has("sessionState")) this._syncSnapshotUi(changed.get("sessionState") as TripWidgetState | undefined);
  }

  open(): void {
    this._isOpen = true;
    this._isMinimized = false;
    this.setAttribute("open", "");
    void this.updateComplete.then(() => this.renderRoot.querySelector<HTMLTextAreaElement>(".textarea")?.focus());
  }

  close(): void {
    this._isOpen = false;
    this._isMinimized = false;
    this.removeAttribute("open");
    void this.updateComplete.then(() => this.renderRoot.querySelector<HTMLButtonElement>(".launcher")?.focus());
  }

  minimize(): void {
    this._isMinimized = true;
    this._isOpen = false;
    this.removeAttribute("open");
  }

  sendMessage(text: string): void {
    this._draft = text;
    this._submitDraft();
  }

  applyTripEvent(event: TripWidgetEvent): void {
    this.sessionState = reduceTripWidgetState(this.sessionState, event);
  }

  protected override render(): TemplateResult {
    if (this.layout === 'presentation') return this._renderPresentation();

    return html`
      <button class="launcher" part="launcher" type="button" aria-haspopup="dialog" aria-expanded=${String(this._isOpen)} ?hidden=${this._isOpen} @click=${this.open}>
        ${widgetIcon("message")}<span>Туту Разница</span>
      </button>
      <section class="panel" part="panel" role="dialog" aria-modal="false" aria-labelledby="tutu-widget-title" ?hidden=${!this._isOpen} @keydown=${this._handlePanelKeydown}>
        ${this._renderHeader()}
        <div class="body" part="body"><div class="message-viewport" part="message-viewport"><div class="content">${this._renderContent()}</div></div></div>
        ${this._renderComposer()}
      </section>
    `;
  }

  private _renderPresentation(): TemplateResult {
    const isScenario = this.experience === 'scenario';
    const scenarioState = getPresentationState(this.presentationStep);

    return html`
      <button class="launcher" part="launcher" type="button" aria-haspopup="dialog" aria-expanded=${String(this._isOpen)} ?hidden=${this._isOpen} @click=${this.open}>
        ${widgetIcon("message")}<span>Открыть Туту Разницу</span>
      </button>
      <section class="panel panel--presentation" part="panel" role="dialog" aria-modal="false" aria-labelledby="tutu-widget-title" ?hidden=${!this._isOpen} @keydown=${this._handlePanelKeydown}>
        ${this._renderHeader()}
        ${isScenario
          ? this._renderScenario(scenarioState)
          : html`<div class="body body--presentation-live">
              <div class="message-viewport"><div class="content">
                ${this._renderContent()}
              </div></div>
            </div>${this._renderComposer()}`}
      </section>
    `;
  }

  private _renderScenario(state: TripWidgetState): TemplateResult {
    const step = this.presentationStep;
    const showsRoutes = step !== 'request';
    const isDifference = step === 'difference';
    const isConstraint = step === 'constraint';
    const isRecommendation = step === 'recommendation';

    return html`<div class="presentation-shell">
      <p class="scenario-provenance">${presentationScenario.provenance}</p>
      <div class="scenario-chat">
        ${state.messages.length
          ? html`<div class="messages">${state.messages.map(renderChatItem)}</div>`
          : nothing}
        ${step === 'request' ? html`
          <section class="scenario-context">
            <strong>${presentationScenario.event.title}</strong>
            <span>${presentationScenario.event.time}</span>
            <span>${presentationScenario.event.place}</span>
            <div class="request-items">${state.request?.items.map((item) => html`<span class="request-item">${item.text}</span>`)}</div>
          </section>
        ` : nothing}
        ${showsRoutes ? html`<presentation-comparison-board
          .routes=${state.routes}
          .excludedRouteIds=${isConstraint ? presentationScenario.excludedRouteIds : []}
        ></presentation-comparison-board>` : nothing}
        ${isDifference ? html`
          <presentation-difference-summary
            .priceDelta=${presentationScenario.difference.priceDelta}
            .durationDeltaMinutes=${presentationScenario.difference.durationDeltaMinutes}
            .totalCostDeltaMin=${presentationScenario.difference.totalCostDeltaMin}
            .totalCostDeltaMax=${presentationScenario.difference.totalCostDeltaMax}
          ></presentation-difference-summary>
          <p class="estimate-note">* Такси Московский вокзал → BASE SPb: ${presentationScenario.taxiEstimate} — ${presentationScenario.taxiSource}.</p>
        ` : nothing}
        ${state.progressText ? html`<div class="progress" role="status"><span class="progress-dot" aria-hidden="true"></span><span>${state.progressText}</span></div>` : nothing}
        ${isDifference || isRecommendation ? html`
          <p class="recommendation">${state.recommendation?.text}</p>
        ` : nothing}
        ${isRecommendation ? html`
          <button class="primary-action" type="button" @click=${() => this._setExperience('live')}>Попробовать свой запрос</button>
        ` : nothing}
      </div>
    </div>`;
  }

  protected override updated(): void {
    const textarea = this.renderRoot.querySelector<HTMLTextAreaElement>(".textarea");
    if (textarea) { textarea.style.height = "auto"; textarea.style.height = `${Math.min(textarea.scrollHeight, 112)}px`; }
  }

  private _renderHeader(): TemplateResult {
    return html`<header class="header" part="header">
      <div class="brand-mark" part="brand-mark" aria-hidden="true">${widgetIcon("brand", 21)}</div>
      <div class="title-row"><h2 id="tutu-widget-title" class="title">Туту Разница</h2><span class="beta">beta</span></div>
      <div class="header-actions">
        <button class="icon-button" type="button" aria-label="Свернуть" @click=${this.minimize}>${widgetIcon("minus")}</button>
        <button class="icon-button" type="button" aria-label="Закрыть" @click=${this.close}>${widgetIcon("close")}</button>
      </div>
    </header>`;
  }

  private _renderContent(): TemplateResult {
    if (this.sessionState.phase === "error") return html`${this._renderRequestSummary()}<div class="error">${this.sessionState.errorText}</div>`;
    if (this._expandedRouteId || this.sessionState.phase === "detail") return this._renderRouteDetail();

    switch (this.sessionState.phase) {
      case "idle": return this._renderIdle();
      case "conversation": return this._renderConversation();
      case "searching": return html`${this._renderRequestSummary()}${this._renderProgress()}`;
      case "results":
      case "enriching": return html`${this._renderRequestSummary()}${this._renderRouteList()}${this._renderProgress()}`;
      case "recalculating": return html`${this._renderConversation()}${this._renderRequestSummary()}${this._renderRouteList(true)}${this._renderProgress()}`;
      case "ready": return this._renderRecommendation();
    }
  }

  private _renderIdle(): TemplateResult {
    const selectedPrompts = INTAKE_PROMPTS.filter((prompt) => this._selectedIntakePrompts.includes(prompt.id));
    return html`
      <div class="intro">
        <span class="intro-kicker">Начнём с главного</span>
        <h3>Соберём поездку без неприятных сюрпризов</h3>
        <p>Укажите маршрут и дату. Остальное можно выбрать подсказками — или написать своими словами.</p>
      </div>
      <form class="intake" @submit=${this._handleIntakeSubmit}>
        <div class="field-group field-group--route">
          <label class="field">
            <span>Откуда</span>
            <input data-intake-field="origin" type="text" autocomplete="address-level2" placeholder="Москва" .value=${this._intakeOrigin} @input=${this._handleOriginInput} />
          </label>
          <span class="route-arrow" aria-hidden="true">→</span>
          <label class="field">
            <span>Куда</span>
            <input data-intake-field="destination" type="text" autocomplete="address-level2" placeholder="Санкт-Петербург" .value=${this._intakeDestination} @input=${this._handleDestinationInput} />
          </label>
        </div>
        <label class="field field--date">
          <span>Дата поездки</span>
          <input data-intake-field="date" type="date" .value=${this._intakeDate} @input=${this._handleDateInput} />
        </label>
        <fieldset class="prompt-picker">
          <legend>Что важно в поездке?</legend>
          <div class="prompt-options">
            ${INTAKE_PROMPTS.map((prompt) => html`
              <button class="prompt" type="button" aria-pressed=${String(this._selectedIntakePrompts.includes(prompt.id))} @click=${() => this._toggleIntakePrompt(prompt.id)}>${prompt.label}</button>
            `)}
          </div>
        </fieldset>
        <section class="intake-preview" aria-live="polite" aria-label="Собранный запрос">
          <div class="preview-heading">
            <div>
              <span class="preview-kicker">Собранный запрос</span>
              <h4>${this._intakeRouteTitle()}</h4>
            </div>
            <button class="preview-edit" type="button" @click=${() => this._focusIntakeField("origin")}>Изменить</button>
          </div>
          <div class="request-items">
            ${this._intakeDate
              ? html`<button class="request-item" type="button" @click=${() => this._focusIntakeField("date")}>${this._formatIntakeDate(this._intakeDate)}</button>`
              : html`<button class="request-item request-item--empty" type="button" @click=${() => this._focusIntakeField("date")}>Добавьте дату</button>`}
            ${selectedPrompts.length
              ? selectedPrompts.map((prompt) => html`<button class="request-item" type="button" @click=${() => this._toggleIntakePrompt(prompt.id)}>${prompt.label}</button>`)
              : html`<span class="request-item request-item--empty">Без дополнительных условий</span>`}
          </div>
        </section>
        ${this._intakeError ? html`<p class="intake-error" role="alert">${this._intakeError}</p>` : nothing}
        <button class="primary-action primary-action--search" type="submit"><span>Искать сейчас</span><span aria-hidden="true">→</span></button>
      </form>
      <p class="intake-note">Маршрут и дата обязательны. Подсказки можно менять в любой момент.</p>
    `;
  }

  private _renderConversation(): TemplateResult {
    return html`<div class="messages">${this.sessionState.messages.map(renderChatItem)}</div>`;
  }

  private _renderRequestSummary(): TemplateResult | typeof nothing {
    const request = this.sessionState.request;
    if (!request) return nothing;
    return html`<section class="request-summary" aria-label="Краткое описание поездки"><h3>${request.title}</h3><div class="request-items">
      ${request.items.map((item) => item.field
        ? html`<button class="request-item" type="button" @click=${() => this._requestEdit(item.field!, item.value ?? "")}>${item.text}</button>`
        : html`<span class="request-item">${item.text}</span>`)}
    </div></section>`;
  }

  private _renderRouteList(muted = false): TemplateResult {
    const selectedId = this._selectedRouteId ?? this.sessionState.selectedRouteId;
    return html`<div class="route-list ${muted ? "route-list--muted" : ""}" @tutu-route-select=${this._handleRouteSelect}>
      ${repeat(this.sessionState.routes, (route) => route.id, (route) => html`
        <trip-option-card .route=${route} .selected=${route.id === selectedId} .loading=${route.analysisStatus === "enriching"} .disabled=${muted}></trip-option-card>
      `)}
    </div>`;
  }

  private _renderRouteDetail(): TemplateResult {
    const route = this._currentRoute();
    if (!route) return html`${this._renderRequestSummary()}${this._renderRouteList()}`;
    return html`<button class="back" type="button" aria-label="Назад к вариантам" @click=${this._backToRoutes}>${widgetIcon("back", 17)} Назад</button>
      <article class="detail">
        <div class="detail-top"><h3>${route.title}</h3><span class="detail-price">${this._formatPrice(route.price)}</span></div>
        <div class="detail-times">${route.departureTime} → ${route.arrivalTime}</div>
        ${route.difference ? html`<div class="detail-difference"><h4>${route.difference.headline}</h4><ul class="difference-list">${route.difference.items.map((item) => html`<li>${item}</li>`)}</ul>
          ${route.difference.compareRouteId ? html`<button class="secondary-action" type="button" @click=${() => this._compareWith(route.difference!.compareRouteId!)}>${route.difference.actionLabel}</button>` : nothing}
        </div>` : nothing}
      </article>`;
  }

  private _renderProgress(): TemplateResult | typeof nothing {
    if (!this.sessionState.progressText) return nothing;
    return html`<div class="progress" role="status" aria-live="polite"><span class="progress-dot" aria-hidden="true"></span><span>${this.sessionState.progressText}</span></div>`;
  }

  private _renderRecommendation(): TemplateResult {
    const recommendation = this.sessionState.recommendation;
    const route = this.sessionState.routes.find((item) => item.id === recommendation?.routeId);
    if (!recommendation || !route) return html`${this._renderRequestSummary()}${this._renderRouteList()}`;
    return html`<p class="recommendation">${recommendation.text}</p><div class="route-list"><trip-option-card .route=${route} .selected=${true}></trip-option-card></div>
      <button class="primary-action" type="button" @click=${() => this._book(route.id)}>${recommendation.ctaLabel}</button>`;
  }

  private _renderComposer(): TemplateResult | typeof nothing {
    if (this.experience === 'scenario' || this.sessionState.phase === 'idle') {
      return nothing;
    }
    const active = this.sessionState.phase !== "error";
    const placeholder = "Измените условие или задайте вопрос…";
    return html`<div class="composer-shell"><form class="composer" @submit=${this._handleSubmit}>
      <label class="visually-hidden" for="tutu-widget-message">${placeholder}</label>
      <textarea id="tutu-widget-message" class="textarea" rows="1" maxlength="1200" placeholder=${placeholder} aria-label=${placeholder} .value=${this._draft} ?disabled=${!active} @input=${this._handleInput} @keydown=${this._handleTextareaKeydown}></textarea>
      <button class="send-button" type="submit" aria-label="Отправить" ?disabled=${!active || !this._draft.trim()}>${widgetIcon("send", 19)}</button>
    </form></div>`;
  }

  private _setExperience(experience: 'live' | 'scenario'): void {
    this.experience = experience;
    this._emit('tutu-experience-change', { experience });
  }


  private _syncSnapshotUi(previous?: TripWidgetState): void {
    if (this.sessionState?.phase === "idle" && previous && previous.phase !== "idle") this._resetIntake();
    const selected = this.sessionState?.selectedRouteId ?? null;
    this._selectedRouteId = selected;
    if (this.sessionState?.phase === "detail" && (!this._expandedRouteId || previous?.selectedRouteId !== selected)) {
      this._expandedRouteId = selected;
    } else if (this.sessionState?.phase !== "results" && this.sessionState?.phase !== "enriching" && this.sessionState?.phase !== "detail") {
      this._expandedRouteId = null;
    } else if (this._expandedRouteId && !this.sessionState?.routes.some((route) => route.id === this._expandedRouteId)) {
      this._expandedRouteId = null;
    }
  }

  private _currentRoute(): TripRoute | undefined {
    const id = this._expandedRouteId ?? this._selectedRouteId ?? this.sessionState.selectedRouteId;
    return this.sessionState.routes.find((route) => route.id === id);
  }

  private _handleRouteSelect = (event: CustomEvent<{ routeId: string }>): void => {
    this._selectedRouteId = event.detail.routeId;
    this._expandedRouteId = event.detail.routeId;
  };

  private _compareWith(routeId: string): void {
    this._selectedRouteId = routeId;
    this._expandedRouteId = routeId;
    this._emit("tutu-route-select", { routeId });
  }

  private _backToRoutes = (): void => { this._expandedRouteId = null; };
  private _handleSubmit = (event: Event): void => { event.preventDefault(); this._submitDraft(); };
  private _handleInput = (event: Event): void => { this._draft = (event.currentTarget as HTMLTextAreaElement).value; };
  private _handleTextareaKeydown = (event: KeyboardEvent): void => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); this._submitDraft(); } };
  private _handlePanelKeydown = (event: KeyboardEvent): void => { if (event.key === "Escape") { event.preventDefault(); this.close(); } };
  private _handleOriginInput = (event: Event): void => { this._intakeOrigin = (event.currentTarget as HTMLInputElement).value; this._intakeError = null; };
  private _handleDestinationInput = (event: Event): void => { this._intakeDestination = (event.currentTarget as HTMLInputElement).value; this._intakeError = null; };
  private _handleDateInput = (event: Event): void => { this._intakeDate = (event.currentTarget as HTMLInputElement).value; this._intakeError = null; };
  private _toggleIntakePrompt(id: string): void {
    this._selectedIntakePrompts = this._selectedIntakePrompts.includes(id)
      ? this._selectedIntakePrompts.filter((current) => current !== id)
      : [...this._selectedIntakePrompts, id];
  }
  private _handleIntakeSubmit = (event: Event): void => {
    event.preventDefault();
    const origin = this._intakeOrigin.trim();
    const destination = this._intakeDestination.trim();
    if (!origin) return this._setIntakeError("Укажите город отправления.", "origin");
    if (!destination) return this._setIntakeError("Укажите город прибытия.", "destination");
    if (!this._intakeDate) return this._setIntakeError("Выберите дату поездки.", "date");

    const selectedPrompts = INTAKE_PROMPTS.filter((prompt) => this._selectedIntakePrompts.includes(prompt.id));
    const extra = this._draft.trim();
    const text = [
      `${origin} → ${destination}`,
      `дата поездки: ${this._formatIntakeDate(this._intakeDate)} (${this._intakeDate})`,
      selectedPrompts.length ? `важно: ${selectedPrompts.map((prompt) => prompt.phrase).join(", ")}` : "",
      extra ? `дополнение: ${extra}` : ""
    ].filter(Boolean).join(". ");
    this._intakeError = null;
    this._startTravelRun(text);
    this._draft = "";
  };
  private _setIntakeError(message: string, field: "origin" | "destination" | "date"): void {
    this._intakeError = message;
    this._focusIntakeField(field);
  }
  private _focusIntakeField(field: "origin" | "destination" | "date"): void {
    void this.updateComplete.then(() => this.renderRoot.querySelector<HTMLInputElement>(`[data-intake-field="${field}"]`)?.focus());
  }
  private _intakeRouteTitle(): string {
    const origin = this._intakeOrigin.trim() || "Откуда";
    const destination = this._intakeDestination.trim() || "куда";
    return `${origin} → ${destination}`;
  }
  private _formatIntakeDate(value: string): string {
    const date = new Date(`${value}T12:00:00`);
    if (Number.isNaN(date.getTime())) return value;
    return new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "long" }).format(date);
  }
  private _resetIntake(): void {
    this._intakeOrigin = "";
    this._intakeDestination = "";
    this._intakeDate = "";
    this._selectedIntakePrompts = [];
    this._intakeError = null;
  }
  private _submitDraft(): void { const text = this._draft.trim(); if (!text || this.sessionState.phase === "error") return; this._startTravelRun(text); this._draft = ""; }
  private _startTravelRun(text: string): void {
    this._travelEvents?.close();
    this._travelEvents = null;
    const generation = ++this._travelRequestGeneration;
    this._emit("tutu-message-submit", { text });
    this.sessionState = {
      phase: "searching",
      request: {
        title: text.split(".", 1)[0]?.trim() || "Новая поездка",
        items: [{ text: "Запрос принят", field: null, value: null }]
      },
      messages: [
        { id: `user-${generation}`, role: "user", text },
        { id: `assistant-${generation}`, role: "assistant", text: "Понял. Ищу реальные варианты…" }
      ],
      routes: [],
      selectedRouteId: null,
      progressText: "Подключаюсь к поиску…",
      recommendation: null,
      errorText: null
    };
    void startTravelRun(
      text,
      (event) => { if (generation === this._travelRequestGeneration) this._applyTravelRunEvent(event); },
      (error) => { if (generation === this._travelRequestGeneration) this._showTravelError(error.message); }
    ).then((source) => {
      if (generation === this._travelRequestGeneration) this._travelEvents = source;
      else source.close();
    }).catch((error: unknown) => {
      if (generation === this._travelRequestGeneration) {
        this._showTravelError(error instanceof Error ? error.message : "Не удалось начать поиск.");
      }
    });
  }
  private _applyTravelRunEvent(event: TravelRunSseEvent): void {
    switch (event.type) {
      case "run.started":
        return;
      case "progress.updated":
        this.sessionState = {
          ...this.sessionState,
          phase: this.sessionState.routes.length ? "enriching" : "searching",
          progressText: event.text
        };
        return;
      case "widget.state":
      case "run.completed":
        this.sessionState = event.state;
        return;
      case "run.waiting_for_user":
        this.sessionState = {
          ...this.sessionState,
          phase: "conversation",
          progressText: null,
          messages: [
            ...this.sessionState.messages,
            { id: `question-${Date.now()}`, role: "assistant", text: event.question }
          ]
        };
        return;
      case "run.failed":
        this._showTravelError(event.message);
    }
  }
  private _showTravelError(message: string): void {
    this.applyTripEvent({ type: "session.failed", payload: { message } });
  }
  private _requestEdit(field: string, value: string): void { this._emit("tutu-request-edit", { field, value }); }
  private _book(routeId: string): void { this._emit("tutu-book", { routeId }); }
  private _emit(name: string, detail: Record<string, string>): void { this.dispatchEvent(new CustomEvent(name, { detail, bubbles: true, composed: true })); }
  private _formatPrice(price: number): string { return `${new Intl.NumberFormat("ru-RU").format(price)} ₽`; }
}
