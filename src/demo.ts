import './components/presentation-landing-card';
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
const landingCard = document.querySelector<HTMLElement & {
  step: PresentationStep;
  experience: Experience;
}>('presentation-landing-card');
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
  if (landingCard) {
    landingCard.step = widget.presentationStep;
    landingCard.experience = widget.experience;
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
