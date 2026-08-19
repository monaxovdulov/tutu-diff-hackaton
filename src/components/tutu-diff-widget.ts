import { LitElement, html, nothing, type TemplateResult } from "lit";
import { repeat } from "lit/directives/repeat.js";
import { getTutuDemoState } from "../fixtures/tutu-demo-states";
import { reduceTripWidgetState, type TripRoute, type TripWidgetEvent, type TripWidgetState } from "../domain/trip-widget-state";
import { messageStyles } from "../styles/message.styles";
import { widgetStyles } from "../styles/widget.styles";
import { widgetIcon } from "../ui/icons";
import "./trip-option-card";
import { renderChatItem } from "./widget-message";

export const TUTU_DIFF_WIDGET_TAG_NAME = "tutu-diff-widget";

export class TutuDiffWidgetElement extends LitElement {
  static override properties = {
    sessionState: { attribute: false },
    _draft: { state: true },
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
  private _draft = "";
  private _selectedRouteId: string | null = null;
  private _expandedRouteId: string | null = null;
  private _isOpen = false;
  private _isMinimized = false;

  override connectedCallback(): void {
    super.connectedCallback();
    this._isOpen = this.hasAttribute("open");
    this._syncSnapshotUi();
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
    const chips = ["Маршрут", "Даты", "Бюджет", "После события", "Без ночных пересадок"];
    return html`<div class="intro"><h3>Найдём вариант без неприятных сюрпризов</h3><p>Расскажите о поездке свободным текстом — покажем не только билеты, но и разницу между ними.</p></div>
      <div class="quick-replies">${chips.map((chip) => html`<button class="quick-reply" type="button" @click=${() => this._prefill(chip)}>${chip}</button>`)}</div>`;
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

  private _renderComposer(): TemplateResult {
    const active = this.sessionState.phase !== "error";
    const placeholder = this.sessionState.phase === "idle" ? "Куда и как хотите поехать?" : "Измените условие или задайте вопрос…";
    return html`<div class="composer-shell"><form class="composer" @submit=${this._handleSubmit}>
      <label class="visually-hidden" for="tutu-widget-message">${placeholder}</label>
      <textarea id="tutu-widget-message" class="textarea" rows="1" maxlength="1200" placeholder=${placeholder} aria-label=${placeholder} .value=${this._draft} ?disabled=${!active} @input=${this._handleInput} @keydown=${this._handleTextareaKeydown}></textarea>
      <button class="send-button" type="submit" aria-label="Отправить" ?disabled=${!active || !this._draft.trim()}>${widgetIcon("send", 19)}</button>
    </form></div>`;
  }

  private _syncSnapshotUi(previous?: TripWidgetState): void {
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
  private _prefill(text: string): void { this._draft = this._draft ? `${this._draft} ${text.toLowerCase()}` : text; void this.updateComplete.then(() => this.renderRoot.querySelector<HTMLTextAreaElement>(".textarea")?.focus()); }
  private _submitDraft(): void { const text = this._draft.trim(); if (!text || this.sessionState.phase === "error") return; this._emit("tutu-message-submit", { text }); this._draft = ""; }
  private _requestEdit(field: string, value: string): void { this._emit("tutu-request-edit", { field, value }); }
  private _book(routeId: string): void { this._emit("tutu-book", { routeId }); }
  private _emit(name: string, detail: Record<string, string>): void { this.dispatchEvent(new CustomEvent(name, { detail, bubbles: true, composed: true })); }
  private _formatPrice(price: number): string { return `${new Intl.NumberFormat("ru-RU").format(price)} ₽`; }
}
