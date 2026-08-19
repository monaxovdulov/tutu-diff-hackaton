import { css } from "lit";

export const messageStyles = css`
  .message-root { align-items: flex-start; align-self: flex-start; display: flex; flex-direction: column; max-width: 86%; min-width: 0; }
  .message-root--visitor { align-items: flex-end; align-self: flex-end; }
  .message { background: var(--sw-color-surface-message-assistant); border: 1px solid var(--sw-color-border-soft); border-radius: var(--sw-radius-message); box-shadow: 0 4px 15px rgba(0,0,0,.03); max-width: 100%; min-width: 0; padding: 11px 13px; }
  .message--visitor { background: var(--sw-color-surface-message-visitor); border-color: transparent; border-top-right-radius: 6px; }
  .message--assistant { border-top-left-radius: 6px; }
  .message--status { background: transparent; border: 0; box-shadow: none; color: var(--sw-color-text-secondary); padding-left: 0; }
  .message__text { font-size: 14px; line-height: 1.45; margin: 0; overflow-wrap: anywhere; white-space: pre-wrap; }
  .typing { align-items: center; align-self: flex-start; display: flex; }
  .typing__dots { align-items: center; background: #fff; border: 1px solid var(--sw-color-border-soft); border-radius: 14px 14px 14px 5px; display: inline-flex; gap: 4px; min-height: 34px; padding: 0 12px; }
  .typing__dots i { animation: typing-pulse 1.15s ease-in-out infinite; background: var(--sw-color-text-muted); border-radius: 50%; display: block; height: 5px; opacity: .35; width: 5px; }
  .typing__dots i:nth-child(2) { animation-delay: 140ms; } .typing__dots i:nth-child(3) { animation-delay: 280ms; }
  @keyframes typing-pulse { 50% { opacity: 1; transform: translateY(-1px); } }
`;
