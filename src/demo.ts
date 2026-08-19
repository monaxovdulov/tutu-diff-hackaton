import { mountTutuDiffWidget } from "./index";
import { getTutuDemoState } from "./fixtures/tutu-demo-states";

const params = new URLSearchParams(window.location.search);
let current = Math.min(10, Math.max(1, Number(params.get("demoState")) || 1));
const widget = mountTutuDiffWidget({ open: true, sessionState: getTutuDemoState(current) });
const controls = document.querySelector<HTMLElement>(".demo-controls");

widget.addEventListener("tutu-message-submit", (event) => {
  const text = (event as CustomEvent<{ text?: string }>).detail.text?.trim();
  if (!text) return;
  const conversation = getTutuDemoState(2);
  widget.sessionState = {
    ...conversation,
    messages: [
      { id: "intake-user", role: "user", text },
      { id: "intake-assistant", role: "assistant", text: "Понял вас. Начинаю искать подходящие варианты…" }
    ]
  };
});

function renderControls(): void {
  if (!controls) return;
  controls.replaceChildren(...Array.from({ length: 10 }, (_, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = String(index + 1);
    button.setAttribute("aria-label", `Показать состояние ${index + 1}`);
    button.setAttribute("aria-current", String(current === index + 1));
    button.addEventListener("click", () => {
      current = index + 1;
      widget.sessionState = getTutuDemoState(current);
      const url = new URL(window.location.href);
      url.searchParams.set("demoState", String(current));
      history.replaceState(null, "", url);
      renderControls();
    });
    return button;
  }));
}

renderControls();
