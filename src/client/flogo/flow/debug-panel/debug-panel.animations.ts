import { animate, state, style, transition, trigger, AnimationTriggerMetadata } from '@angular/animations';

export const debugPanelAnimations: {
  readonly transformPanel: AnimationTriggerMetadata;
} = {
  transformPanel: trigger('debugpanel', [
    state('open, open-instant', style({
      'transform': 'translate3d(0, 0, 0)',
      'visibility': 'visible',
    })),
    state('void', style({
      'box-shadow': 'none',
      'visibility': 'hidden',
    })),
    transition('void => open-instant', animate('0ms')),
    transition('void <=> open, open-instant => void',
      animate('400ms cubic-bezier(0.25, 0.8, 0.25, 1)'))
  ])
};
