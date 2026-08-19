import { html, type TemplateResult } from "lit";
import type { TripMessage } from "../domain/trip-widget-state";

export function renderChatItem(message: TripMessage): TemplateResult {
  const role = message.role === "user" ? "visitor" : message.role;
  return html`
    <div class="message-root message-root--${role}">
      <article class="message message--${role}" part="message message-${role} message-bubble">
        <p class="message__text">${message.text}</p>
      </article>
    </div>
  `;
}

export function renderTypingIndicator(): TemplateResult {
  return html`
    <div class="typing" role="status" aria-label="Ассистент печатает">
      <span class="typing__dots" aria-hidden="true"><i></i><i></i><i></i></span>
    </div>
  `;
}
