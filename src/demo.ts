import './components/presentation-story-rail';
import { mountTutuDiffWidget } from './index';
import {
  PRESENTATION_STEPS,
  type PresentationStep,
} from './scenario/presentation-scenario';

type Experience = 'live' | 'scenario';

const params = new URLSearchParams(window.location.search);
const initialExperience: Experience = params.get('experience') === 'live'
  ? 'live'
  : 'scenario';
const requestedStep = params.get('step') as PresentationStep | null;
const initialStep = requestedStep && PRESENTATION_STEPS.includes(requestedStep)
  ? requestedStep
  : 'difference';
const target = document.querySelector<HTMLElement>('.demo-widget');
const storyRail = document.querySelector('presentation-story-rail');
const stepsShell = document.querySelector<HTMLElement>('.demo-steps');
const experienceButtons = document.querySelectorAll<HTMLButtonElement>(
  '[data-experience]',
);
const widget = mountTutuDiffWidget({
  target: target ?? document.body,
  open: true,
  position: 'inline',
  layout: 'presentation',
  experience: initialExperience,
  presentationStep: initialStep,
});

const updateUrl = (
  experience: Experience,
  step: PresentationStep,
): void => {
  const url = new URL(window.location.href);
  url.searchParams.set('experience', experience);
  url.searchParams.set('step', step);
  history.replaceState(null, '', url);
};

const renderLandingState = (): void => {
  if (storyRail) storyRail.step = widget.presentationStep;
  if (stepsShell) stepsShell.hidden = widget.experience === 'live';

  for (const button of experienceButtons) {
    const isSelected = button.dataset.experience === widget.experience;
    button.setAttribute('aria-selected', String(isSelected));
  }
};

const setExperience = (experience: Experience, shouldUpdateUrl = true): void => {
  widget.experience = experience;
  renderLandingState();
  if (shouldUpdateUrl) updateUrl(experience, widget.presentationStep);
};

const setStep = (step: PresentationStep, shouldUpdateUrl = true): void => {
  widget.presentationStep = step;
  renderLandingState();
  if (shouldUpdateUrl) updateUrl(widget.experience, step);
};

for (const button of experienceButtons) {
  button.addEventListener('click', () => {
    setExperience(button.dataset.experience === 'live' ? 'live' : 'scenario');
  });
}

storyRail?.addEventListener('tutu-presentation-step', (event) => {
  const customEvent = event as CustomEvent<{ step: PresentationStep }>;
  setStep(customEvent.detail.step);
});

widget.addEventListener('tutu-experience-change', (event) => {
  const customEvent = event as CustomEvent<{ experience: Experience }>;
  setExperience(customEvent.detail.experience);
});

window.addEventListener('popstate', () => {
  const nextParams = new URLSearchParams(window.location.search);
  const experience = nextParams.get('experience') === 'live'
    ? 'live'
    : 'scenario';
  const nextStep = nextParams.get('step') as PresentationStep | null;

  setExperience(experience, false);
  setStep(
    nextStep && PRESENTATION_STEPS.includes(nextStep)
      ? nextStep
      : 'difference',
    false,
  );
});

renderLandingState();
