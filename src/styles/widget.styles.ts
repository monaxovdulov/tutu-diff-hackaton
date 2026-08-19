import { css } from "lit";

export const widgetStyles = css`
  :host {
    --sw-color-accent: #ff765f;
    --sw-color-accent-text: #fff;
    --sw-color-surface-panel: #fffaf7;
    --sw-color-surface-message-assistant: #fff;
    --sw-color-surface-message-visitor: #ffe3da;
    --sw-color-surface-system: #f7f1ee;
    --sw-color-surface-control: #fff;
    --sw-color-border-soft: rgba(71,45,35,.11);
    --sw-color-text-primary: #292522;
    --sw-color-text-secondary: #746762;
    --sw-color-text-muted: #91837d;
    --sw-font-family: system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;
    --sw-radius-panel: 24px;
    --sw-radius-message: 16px;
    --sw-radius-button: 999px;
    --sw-radius-input: 22px;
    --sw-shadow-panel: 0 24px 80px rgba(72,38,26,.18);
    --sw-shadow-launcher: 0 14px 34px rgba(85,40,25,.2);
    bottom: max(24px, env(safe-area-inset-bottom));
    color: var(--sw-color-text-primary);
    display: block;
    font-family: var(--sw-font-family);
    position: fixed;
    right: max(24px, env(safe-area-inset-right));
    z-index: 2147483000;
  }

  :host([position="bottom-left"]) {
    left: max(24px, env(safe-area-inset-left));
    right: auto;
  }

  :host([position="inline"]) {
    bottom: auto;
    left: auto;
    position: relative;
    right: auto;
    z-index: auto;
  }

  * { box-sizing: border-box; }
  button, textarea { font: inherit; }
  button { color: inherit; }
  svg { display: block; pointer-events: none; }
  [hidden] { display: none !important; }

  .visually-hidden {
    clip: rect(0 0 0 0);
    clip-path: inset(50%);
    height: 1px;
    overflow: hidden;
    position: absolute;
    white-space: nowrap;
    width: 1px;
  }

  .launcher {
    align-items: center;
    background: var(--sw-color-accent);
    border: 0;
    border-radius: var(--sw-radius-button);
    box-shadow: var(--sw-shadow-launcher);
    color: #fff;
    cursor: pointer;
    display: inline-flex;
    font-weight: 680;
    gap: 10px;
    min-height: 58px;
    padding: 0 22px;
  }

  .collapsed-card {
    align-items: center;
    background: rgba(255,250,247,.92);
    border: 1px solid rgba(255,255,255,.74);
    border-radius: 24px;
    box-shadow: 0 22px 70px rgba(72,38,26,.16);
    color: var(--sw-color-text-primary);
    cursor: pointer;
    display: grid;
    gap: 12px;
    grid-template-columns: 42px minmax(0, 1fr) auto;
    min-height: 82px;
    padding: 14px;
    text-align: left;
    width: min(420px, 100%);
  }

  .collapsed-card:hover {
    border-color: rgba(255,118,95,.4);
    box-shadow: 0 26px 78px rgba(72,38,26,.2);
  }

  .collapsed-brand {
    align-items: center;
    background: #fff;
    border-radius: 50%;
    color: #d84e39;
    display: inline-flex;
    height: 42px;
    justify-content: center;
    width: 42px;
  }

  .collapsed-copy {
    display: grid;
    gap: 3px;
    min-width: 0;
  }

  .collapsed-copy strong {
    font-size: 16px;
    letter-spacing: -.02em;
  }

  .collapsed-copy span {
    color: var(--sw-color-text-secondary);
    font-size: 12px;
  }

  .collapsed-action {
    background: #292522;
    border-radius: 999px;
    color: #fff;
    font-size: 12px;
    font-weight: 720;
    padding: 8px 10px;
  }

  .panel {
    background: var(--sw-color-surface-panel);
    border: 1px solid var(--sw-color-border-soft);
    border-radius: var(--sw-radius-panel);
    box-shadow: var(--sw-shadow-panel);
    display: flex;
    flex-direction: column;
    height: min(720px, calc(100dvh - 48px));
    overflow: hidden;
    width: min(410px, calc(100vw - 48px));
  }

  .header {
    align-items: center;
    background: #ff9b83;
    border-bottom: 1px solid rgba(87,41,28,.08);
    display: grid;
    gap: 10px;
    grid-template-columns: 38px minmax(0,1fr) auto;
    min-height: 68px;
    padding: 12px 12px 12px 14px;
  }

  .brand-mark {
    align-items: center;
    background: rgba(255,255,255,.82);
    border-radius: 50%;
    color: #d84e39;
    display: inline-flex;
    height: 38px;
    justify-content: center;
    width: 38px;
  }

  .title-row {
    align-items: center;
    display: flex;
    gap: 7px;
    min-width: 0;
  }

  .title {
    font-size: 17px;
    letter-spacing: -.02em;
    margin: 0;
  }

  .beta {
    background: rgba(255,255,255,.55);
    border-radius: 999px;
    font-size: 10px;
    font-weight: 750;
    letter-spacing: .06em;
    padding: 3px 6px;
    text-transform: uppercase;
  }

  .header-actions {
    display: flex;
    gap: 4px;
  }

  .icon-button {
    align-items: center;
    background: rgba(255,255,255,.48);
    border: 0;
    border-radius: 50%;
    cursor: pointer;
    display: inline-flex;
    height: 34px;
    justify-content: center;
    padding: 0;
    width: 34px;
  }

  .body {
    flex: 1;
    min-height: 0;
    overflow: hidden;
  }

  .message-viewport {
    height: 100%;
    overflow-x: hidden;
    overflow-y: auto;
    overscroll-behavior: contain;
    padding: 16px 14px 14px;
    scrollbar-width: none;
  }

  .message-viewport::-webkit-scrollbar,
  .presentation-shell::-webkit-scrollbar { display: none; }

  .content,
  .messages {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  .content { gap: 13px; }
  .messages { gap: 10px; }

  .intro {
    padding: 2px 1px 0;
  }

  .intro-kicker,
  .field > span,
  .prompt-picker legend {
    color: var(--sw-color-text-muted);
    font-size: 10px;
    font-weight: 760;
    letter-spacing: .08em;
    text-transform: uppercase;
  }

  .intro-kicker {
    display: block;
    margin-bottom: 6px;
  }

  .intro h3 {
    font-size: 22px;
    letter-spacing: -.035em;
    line-height: 1.08;
    margin: 0 0 6px;
  }

  .intro p {
    color: var(--sw-color-text-secondary);
    font-size: 13px;
    line-height: 1.4;
    margin: 0;
  }

  .intake {
    display: grid;
    gap: 13px;
  }

  .field-group--route {
    align-items: end;
    display: grid;
    gap: 7px;
    grid-template-columns: minmax(0,1fr) auto minmax(0,1fr);
  }

  .field {
    display: grid;
    gap: 6px;
    min-width: 0;
  }

  .field input {
    background: #fff;
    border: 1px solid var(--sw-color-border-soft);
    border-radius: 12px;
    color: var(--sw-color-text-primary);
    min-height: 42px;
    min-width: 0;
    outline: none;
    padding: 0 11px;
    width: 100%;
  }

  .field input:focus-visible {
    border-color: var(--sw-color-accent);
    box-shadow: 0 0 0 3px rgba(255,118,95,.16);
  }

  .field--date { max-width: 190px; }

  .route-arrow {
    color: var(--sw-color-text-muted);
    font-size: 18px;
    padding-bottom: 10px;
  }

  .prompt-picker {
    border: 0;
    margin: 0;
    padding: 0;
  }

  .prompt-picker legend {
    margin-bottom: 8px;
    padding: 0;
  }

  .prompt-options {
    display: flex;
    flex-wrap: wrap;
    gap: 7px;
  }

  .prompt {
    background: #fff;
    border: 1px solid var(--sw-color-border-soft);
    border-radius: 999px;
    cursor: pointer;
    font-size: 12px;
    line-height: 1.2;
    padding: 9px 11px;
    transition: background 140ms ease, border-color 140ms ease, color 140ms ease;
  }

  .prompt:hover { border-color: #efad9f; }

  .prompt[aria-pressed="true"] {
    background: #ffe3da;
    border-color: #ffb09e;
    color: #9a3f30;
    font-weight: 680;
  }

  .intake-error {
    background: #fff0ed;
    border-radius: 12px;
    color: #9a3f30;
    font-size: 13px;
    margin: -4px 0 0;
    padding: 10px 12px;
  }

  .primary-action--search {
    align-items: center;
    display: flex;
    gap: 8px;
    justify-content: center;
  }

  .primary-action--search span:last-child {
    font-size: 18px;
    line-height: 1;
  }

  .request-summary {
    padding: 2px 1px 0;
  }

  .request-summary h3 {
    font-size: 17px;
    letter-spacing: -.02em;
    margin: 0 0 8px;
  }

  .request-items {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  .request-item {
    background: #f5eeea;
    border-radius: 999px;
    color: var(--sw-color-text-secondary);
    display: inline-flex;
    font-size: 12px;
    padding: 6px 9px;
  }

  button.request-item {
    border: 1px solid transparent;
    cursor: pointer;
    text-align: left;
  }

  button.request-item:hover { border-color: #efad9f; }

  .route-list {
    display: grid;
    gap: 9px;
    transition: opacity 140ms ease;
  }

  .route-list--muted { opacity: .64; }

  .progress {
    align-items: center;
    color: var(--sw-color-text-secondary);
    display: flex;
    font-size: 13px;
    gap: 9px;
    min-height: 26px;
  }

  .progress-dot {
    animation: progress-pulse 1.25s ease-in-out infinite;
    border: 2px solid #e5b1a4;
    border-right-color: var(--sw-color-accent);
    border-radius: 50%;
    height: 15px;
    width: 15px;
  }

  .back {
    align-items: center;
    align-self: flex-start;
    background: transparent;
    border: 0;
    color: var(--sw-color-text-secondary);
    cursor: pointer;
    display: inline-flex;
    font-size: 13px;
    gap: 4px;
    padding: 0;
  }

  .detail {
    background: #fff;
    border: 1px solid var(--sw-color-border-soft);
    border-radius: 20px;
    padding: 18px;
  }

  .detail-top {
    align-items: baseline;
    display: flex;
    gap: 8px;
    justify-content: space-between;
  }

  .detail h3 {
    font-size: 18px;
    margin: 0;
  }

  .detail-price {
    font-size: 18px;
    font-weight: 750;
  }

  .detail-times {
    font-size: 22px;
    font-weight: 680;
    margin: 10px 0 18px;
  }

  .detail-difference {
    border-top: 1px solid var(--sw-color-border-soft);
    padding-top: 15px;
  }

  .detail-difference h4 {
    font-size: 15px;
    margin: 0 0 10px;
  }

  .difference-list {
    color: var(--sw-color-text-secondary);
    display: grid;
    font-size: 13px;
    gap: 7px;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .difference-list li::before {
    color: var(--sw-color-accent);
    content: "—";
    margin-right: 7px;
  }

  .secondary-action {
    background: #fff1ec;
    border: 0;
    border-radius: 999px;
    cursor: pointer;
    font-size: 13px;
    font-weight: 650;
    margin-top: 16px;
    padding: 10px 13px;
    width: 100%;
  }

  .recommendation {
    background: #fff;
    border: 1px solid #f2c5b9;
    border-radius: 18px;
    font-size: 15px;
    line-height: 1.4;
    margin: 0;
    padding: 14px;
  }

  .recommendation--compact {
    font-size: 14px;
    padding: 13px;
  }

  .primary-action {
    background: var(--sw-color-accent);
    border: 0;
    border-radius: 999px;
    color: #fff;
    cursor: pointer;
    font-weight: 720;
    min-height: 48px;
    padding: 0 20px;
    width: 100%;
  }

  .error {
    background: #fff0ed;
    border-radius: 15px;
    color: #9a3f30;
    font-size: 14px;
    padding: 13px;
  }

  .composer-shell {
    background: rgba(255,250,247,.96);
    border-top: 1px solid var(--sw-color-border-soft);
    padding: 12px 14px 14px;
  }

  .composer {
    align-items: flex-end;
    background: #fff;
    border: 1px solid var(--sw-color-border-soft);
    border-radius: var(--sw-radius-input);
    display: flex;
    gap: 8px;
    padding: 7px 7px 7px 14px;
  }

  .textarea {
    background: transparent;
    border: 0;
    color: var(--sw-color-text-primary);
    flex: 1;
    line-height: 1.4;
    max-height: 112px;
    min-height: 28px;
    min-width: 0;
    outline: none;
    padding: 4px 0;
    resize: none;
  }

  .textarea::placeholder { color: #a39792; }

  .send-button {
    align-items: center;
    background: var(--sw-color-accent);
    border: 0;
    border-radius: 50%;
    color: #fff;
    cursor: pointer;
    display: inline-flex;
    flex: 0 0 auto;
    height: 38px;
    justify-content: center;
    padding: 0;
    width: 38px;
  }

  .send-button:disabled {
    cursor: default;
    opacity: .38;
  }

  :host([layout="presentation"]) {
    align-items: flex-start;
    bottom: auto;
    display: flex;
    justify-content: flex-end;
    left: auto;
    position: relative;
    right: auto;
    width: 100%;
    z-index: auto;
  }

  :host([layout="presentation"]) .launcher,
  :host([layout="presentation"]) .collapsed-card {
    justify-self: end;
  }

  .panel--presentation {
    border-color: rgba(255,255,255,.78);
    box-shadow: 0 32px 100px rgba(69,36,80,.18), 0 12px 30px rgba(105,48,30,.1);
    height: min(660px, calc(100dvh - 40px));
    width: min(430px, 100%);
  }

  .panel--presentation .header {
    background: linear-gradient(115deg, #ffab8f 0%, #ff806c 54%, #b78ad9 125%);
  }

  .presentation-shell {
    display: grid;
    flex: 1;
    gap: 12px;
    min-height: 0;
    overflow-y: auto;
    padding: 14px;
    scrollbar-width: none;
  }

  .presentation-shell--minimal {
    background: linear-gradient(180deg, rgba(255,255,255,.36), transparent 35%);
  }

  .scenario-chat {
    display: grid;
    gap: 11px;
  }

  .scenario-actions {
    align-items: center;
    display: flex;
    gap: 12px;
    justify-content: space-between;
  }

  .scenario-actions .primary-action {
    min-height: 42px;
    width: auto;
  }

  .body--presentation-live {
    min-height: 0;
  }

  .body--presentation-live .message-viewport {
    padding: 16px 14px 14px;
  }

  .body--presentation-live .content {
    margin: 0;
    max-width: none;
  }

  @keyframes progress-pulse {
    to { transform: rotate(360deg); }
  }

  @media (prefers-reduced-motion: reduce) {
    .progress-dot { animation: none; }
  }

  @media (max-width: 760px) {
    :host([layout="presentation"]) {
      justify-content: stretch;
    }

    .collapsed-card,
    .panel--presentation {
      width: 100%;
    }
  }

  @media (max-width: 640px) {
    :host {
      bottom: 0;
      left: 0;
      right: 0;
    }

    .panel {
      border: 0;
      border-radius: 0;
      height: 100dvh;
      max-height: none;
      width: 100vw;
    }

    :host([layout="presentation"]) .panel {
      height: 100dvh;
      width: 100%;
    }

    .launcher {
      bottom: max(16px, env(safe-area-inset-bottom));
      position: fixed;
      right: max(16px, env(safe-area-inset-right));
    }

    :host([layout="presentation"]) .launcher {
      position: relative;
      right: auto;
      bottom: auto;
    }

    .collapsed-card {
      border-radius: 22px;
      grid-template-columns: 38px minmax(0, 1fr);
    }

    .collapsed-action {
      display: none;
    }

    .presentation-shell {
      padding: 12px 14px 14px;
    }
  }
`;
