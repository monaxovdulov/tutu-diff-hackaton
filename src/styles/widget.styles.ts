import { css } from "lit";

export const widgetStyles = css`
  :host {
    --sw-color-accent: #ff765f; --sw-color-accent-text: #fff; --sw-color-surface-panel: #fffaf7;
    --sw-color-surface-message-assistant: #fff; --sw-color-surface-message-visitor: #ffe3da;
    --sw-color-surface-system: #f7f1ee; --sw-color-surface-control: #fff; --sw-color-border-soft: rgba(71,45,35,.11);
    --sw-color-text-primary: #292522; --sw-color-text-secondary: #746762; --sw-color-text-muted: #91837d;
    --sw-font-family: system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif; --sw-radius-panel: 24px;
    --sw-radius-message: 16px; --sw-radius-button: 999px; --sw-radius-input: 22px;
    --sw-shadow-panel: 0 24px 80px rgba(72,38,26,.18); --sw-shadow-launcher: 0 14px 34px rgba(85,40,25,.2);
    bottom: max(24px, env(safe-area-inset-bottom)); color: var(--sw-color-text-primary); display: block; font-family: var(--sw-font-family);
    position: fixed; right: max(24px, env(safe-area-inset-right)); z-index: 2147483000;
  }
  :host([position="bottom-left"]) { left: max(24px, env(safe-area-inset-left)); right: auto; }
  :host([position="inline"]) { bottom: auto; left: auto; position: relative; right: auto; z-index: auto; }
  * { box-sizing: border-box; } button, textarea { font: inherit; } button { color: inherit; } svg { display: block; pointer-events: none; }
  [hidden] { display: none !important; } .visually-hidden { clip: rect(0 0 0 0); clip-path: inset(50%); height: 1px; overflow: hidden; position: absolute; white-space: nowrap; width: 1px; }
  .launcher { align-items: center; background: var(--sw-color-accent); border: 0; border-radius: var(--sw-radius-button); box-shadow: var(--sw-shadow-launcher); color: #fff; cursor: pointer; display: inline-flex; font-weight: 680; gap: 10px; min-height: 58px; padding: 0 22px; }
  .panel { background: var(--sw-color-surface-panel); border: 1px solid var(--sw-color-border-soft); border-radius: var(--sw-radius-panel); box-shadow: var(--sw-shadow-panel); display: flex; flex-direction: column; height: min(720px, calc(100dvh - 48px)); overflow: hidden; width: min(410px, calc(100vw - 48px)); }
  .header { align-items: center; background: #ff9b83; border-bottom: 1px solid rgba(87,41,28,.08); display: grid; gap: 10px; grid-template-columns: 38px minmax(0,1fr) auto; min-height: 74px; padding: 13px 14px 13px 16px; }
  .brand-mark { align-items: center; background: rgba(255,255,255,.82); border-radius: 50%; color: #d84e39; display: inline-flex; height: 38px; justify-content: center; width: 38px; }
  .title-row { align-items: center; display: flex; gap: 7px; min-width: 0; } .title { font-size: 18px; letter-spacing: -.02em; margin: 0; }
  .beta { background: rgba(255,255,255,.55); border-radius: 999px; font-size: 10px; font-weight: 750; letter-spacing: .06em; padding: 3px 6px; text-transform: uppercase; }
  .header-actions { display: flex; gap: 4px; } .icon-button { align-items: center; background: rgba(255,255,255,.48); border: 0; border-radius: 50%; cursor: pointer; display: inline-flex; height: 36px; justify-content: center; padding: 0; width: 36px; }
  .body { flex: 1; min-height: 0; overflow: hidden; } .message-viewport { height: 100%; overflow-x: hidden; overflow-y: auto; overscroll-behavior: contain; padding: 18px 16px 16px; scrollbar-width: thin; }
  .content { display: flex; flex-direction: column; gap: 14px; min-width: 0; } .messages { display: flex; flex-direction: column; gap: 10px; }
  .intro { padding: 8px 2px 2px; } .intro h3 { font-size: 23px; letter-spacing: -.035em; line-height: 1.08; margin: 0 0 8px; } .intro p { color: var(--sw-color-text-secondary); font-size: 14px; line-height: 1.45; margin: 0; }
  .quick-replies { display: flex; flex-wrap: wrap; gap: 7px; } .quick-reply, .condition { background: #fff; border: 1px solid var(--sw-color-border-soft); border-radius: 999px; cursor: pointer; font-size: 12px; padding: 8px 10px; }
  .request-summary { padding: 2px 1px 0; } .request-summary h3 { font-size: 18px; letter-spacing: -.02em; margin: 0 0 9px; } .request-items { display: flex; flex-wrap: wrap; gap: 6px; }
  .request-item { background: #f5eeea; border-radius: 999px; color: var(--sw-color-text-secondary); display: inline-flex; font-size: 12px; padding: 6px 9px; } button.request-item { border: 1px solid transparent; cursor: pointer; }
  .route-list { display: grid; gap: 9px; transition: opacity 140ms ease; } .route-list--muted { opacity: .64; }
  .progress { align-items: center; color: var(--sw-color-text-secondary); display: flex; font-size: 13px; gap: 9px; min-height: 26px; }
  .progress-dot { animation: progress-pulse 1.25s ease-in-out infinite; border: 2px solid #e5b1a4; border-right-color: var(--sw-color-accent); border-radius: 50%; height: 15px; width: 15px; }
  .back { align-items: center; align-self: flex-start; background: transparent; border: 0; color: var(--sw-color-text-secondary); cursor: pointer; display: inline-flex; font-size: 13px; gap: 4px; padding: 0; }
  .detail { background: #fff; border: 1px solid var(--sw-color-border-soft); border-radius: 20px; padding: 18px; } .detail-top { align-items: baseline; display: flex; gap: 8px; justify-content: space-between; } .detail h3 { font-size: 18px; margin: 0; } .detail-price { font-size: 18px; font-weight: 750; }
  .detail-times { font-size: 22px; font-weight: 680; margin: 10px 0 18px; } .detail-difference { border-top: 1px solid var(--sw-color-border-soft); padding-top: 15px; } .detail-difference h4 { font-size: 15px; margin: 0 0 10px; }
  .difference-list { color: var(--sw-color-text-secondary); display: grid; font-size: 13px; gap: 7px; list-style: none; margin: 0; padding: 0; } .difference-list li::before { color: var(--sw-color-accent); content: "—"; margin-right: 7px; }
  .secondary-action { background: #fff1ec; border: 0; border-radius: 999px; cursor: pointer; font-size: 13px; font-weight: 650; margin-top: 16px; padding: 10px 13px; width: 100%; }
  .recommendation { background: #fff; border: 1px solid #f2c5b9; border-radius: 18px; font-size: 16px; line-height: 1.42; margin: 0; padding: 15px 16px; }
  .primary-action { background: var(--sw-color-accent); border: 0; border-radius: 999px; color: #fff; cursor: pointer; font-weight: 720; min-height: 48px; padding: 0 20px; width: 100%; }
  .error { background: #fff0ed; border-radius: 15px; color: #9a3f30; font-size: 14px; padding: 13px; }
  .composer-shell { background: rgba(255,250,247,.96); border-top: 1px solid var(--sw-color-border-soft); padding: 12px 14px 14px; } .composer { align-items: flex-end; background: #fff; border: 1px solid var(--sw-color-border-soft); border-radius: var(--sw-radius-input); display: flex; gap: 8px; padding: 7px 7px 7px 14px; }
  .textarea { background: transparent; border: 0; color: var(--sw-color-text-primary); flex: 1; line-height: 1.4; max-height: 112px; min-height: 28px; min-width: 0; outline: none; padding: 4px 0; resize: none; } .textarea::placeholder { color: #a39792; }
  .send-button { align-items: center; background: var(--sw-color-accent); border: 0; border-radius: 50%; color: #fff; cursor: pointer; display: inline-flex; flex: 0 0 auto; height: 38px; justify-content: center; padding: 0; width: 38px; } .send-button:disabled { cursor: default; opacity: .38; }
  @keyframes progress-pulse { to { transform: rotate(360deg); } }
  @media (prefers-reduced-motion: reduce) { .progress-dot { animation: none; } }
  @media (max-width: 640px) { :host { bottom: 0; left: 0; right: 0; } .panel { border: 0; border-radius: 0; height: 100dvh; max-height: none; width: 100vw; } .launcher { bottom: max(16px, env(safe-area-inset-bottom)); position: fixed; right: max(16px, env(safe-area-inset-right)); } }
`;
