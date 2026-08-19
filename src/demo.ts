import { mountTutuDiffWidget } from './index';
import {
  PRESENTATION_STEPS,
  type PresentationStep,
} from './scenario/presentation-scenario';

const params = new URLSearchParams(window.location.search);
const experience = params.get('experience') === 'live' ? 'live' : 'scenario';
const requestedStep = params.get('step') as PresentationStep | null;
const presentationStep = requestedStep && PRESENTATION_STEPS.includes(requestedStep)
  ? requestedStep
  : 'difference';
const target = document.querySelector<HTMLElement>('.demo-widget');
const widget = mountTutuDiffWidget({
  target: target ?? document.body,
  open: true,
  position: 'inline',
  layout: 'presentation',
  experience,
  presentationStep,
});

const updateUrl = (
  nextExperience: 'live' | 'scenario',
  nextStep: PresentationStep,
): void => {
  const url = new URL(window.location.href);
  url.searchParams.set('experience', nextExperience);
  url.searchParams.set('step', nextStep);
  history.replaceState(null, '', url);
};

widget.addEventListener('tutu-experience-change', (event) => {
  const customEvent = event as CustomEvent<{
    experience: 'live' | 'scenario';
  }>;
  updateUrl(customEvent.detail.experience, widget.presentationStep);
});

widget.addEventListener('tutu-presentation-step-change', (event) => {
  const customEvent = event as CustomEvent<{ step: PresentationStep }>;
  updateUrl(widget.experience, customEvent.detail.step);
});

window.addEventListener('popstate', () => {
  const nextParams = new URLSearchParams(window.location.search);
  widget.experience = nextParams.get('experience') === 'live'
    ? 'live'
    : 'scenario';
  const nextStep = nextParams.get('step') as PresentationStep | null;
  widget.presentationStep = nextStep && PRESENTATION_STEPS.includes(nextStep)
    ? nextStep
    : 'difference';
});
