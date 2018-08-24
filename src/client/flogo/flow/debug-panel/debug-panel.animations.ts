import {
  animate,
  state,
  style,
  transition,
  trigger,
  AnimationTriggerMetadata,
  group,
  query,
  animateChild,
} from '@angular/animations';

const MINIMIZED_HEIGHT = '47px';
const OPENED_HEIGHT = '40vh';
const OPEN_DELAY = '200ms';
const MINIMIZED_TRANSFORM = `translate3d(0, -${MINIMIZED_HEIGHT}, 0)`;

export const debugPanelAnimations: {
  readonly panelContainer: AnimationTriggerMetadata;
  readonly panel: AnimationTriggerMetadata;
  readonly wrappedContent: AnimationTriggerMetadata;
} = {
  wrappedContent: trigger('wrappedContentState', [
    state('open', style({ 'margin-bottom': '40vh' })),
    state('closed', style({ 'margin-bottom': 0 })),
    transition('open => closed', animate(`350ms 100ms cubic-bezier(0.25, 0.8, 0.25, 1)`)),
    transition('closed => open', animate(`300ms ${OPEN_DELAY} cubic-bezier(0.25, 0.8, 0.25, 1)`)),
  ]),
  panelContainer: trigger('debugPanelContainerState', [
    state('open', style({
      transform: 'translate3d(0, 0, 0)',
    })),
    state('closed', style({
      transform: 'translate3d(30px, 0, 0)',
    })),
    transition('closed => open', [
      group([
        animate(`${OPEN_DELAY} cubic-bezier(0.25, 0.8, 0.25, 1)`,
          style({  transform: 'translate3d(0, 0, 0)', })),
        query('@debugPanelState', animateChild())
      ]),
      animate(`${OPEN_DELAY} cubic-bezier(0.25, 0.8, 0.25, 1)`,
        style({  transform: 'translate3d(0, 0, 0)', })),
    ]),
    transition('open => closed', [
      group([
        animate(`300ms 100ms cubic-bezier(0.25, 0.8, 0.25, 1)`, style({ transform: 'translate3d(30px, 0, 0)', })),
        query('@debugPanelState', animateChild()),
      ]),
    ]),
  ]),
  panel: trigger('debugPanelState', [
    state('open', style({
      width: '100%',
      transform: 'translate3d(0, -100%, 0)',
      height: OPENED_HEIGHT,
    })),
    state('closed', style({
      transform: MINIMIZED_TRANSFORM,
      // todo: auto width animation is not working
      width: '272px',
    })),
    transition('closed => open', [
      style({ overflow: 'hidden', 'height': OPENED_HEIGHT, width: '*' }),
      query('.js-debug-panel-content', style({ opacity: 0 })),
      animate(`${OPEN_DELAY} cubic-bezier(0.25, 0.8, 0.25, 1)`,
        style({ width: '100%',  transform: MINIMIZED_TRANSFORM })),
      group([
        query('.js-debug-panel-content', animate('100ms 200ms', style({ opacity: 1 }))),
        animate('350ms cubic-bezier(0.25, 0.8, 0.25, 1)', style({ 'transform': 'translate3d(0, -100%, 0)' })),
      ]),
    ]),
    transition('open => closed', [
      style({ overflow: 'hidden', 'height': OPENED_HEIGHT }),
      query('.js-debug-panel-content', animate('100ms', style({ opacity: 0 }))),
      animate('350ms cubic-bezier(0.25, 0.8, 0.25, 1)'),
    ]),
  ])
};
