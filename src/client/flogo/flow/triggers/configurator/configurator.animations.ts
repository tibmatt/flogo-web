import { animate, group, keyframes, query, sequence, stagger, state, style, transition, trigger } from '@angular/animations';

const FLOW_HEADER_HEIGHT = 167;
const FLOW_TRIGGER_VERTICAL_PADDING = 40;
const FLOW_TRIGGER_HORIZONTAL_PADDING = 22;
const CONFIGURATOR_HEADER_HEIGHT = 103;
const CONFIGURATOR_PADDING = 40;
const CONFIGURATOR_TRIGGER_PANEL_WIDTH = 230;

const toPixels = number => `${number}px`;

export const configuratorAnimations = [
  trigger('configurationPanel', [
    transition('void => *', [
      group([
        query('.background', [
          style({ width: '88px', transform: 'translateY(167px)', opacity: 0 }),
          group([
            animate('200ms ease-out', keyframes([
              style({ opacity: 0.5, offset: 0.3 }),
              style({ opacity: 1, offset: 1 }),
            ])),
            animate('200ms ease-out', style({
              transform: 'translate(0)'
            })),
            animate('200ms ease-in-out', style({
              width: '100%',
            })),
          ]),
        ]),
        query('.js-triggers-list', [
          style({
            transform: 'translateY(104px)',
          }),
          animate('300ms 50ms cubic-bezier(0.55, 0.085, 0.68, 0.53)', style('*'))
        ]),
        query('.js-trigger-element', [
          style({
            // transform: 'translate(-18px, 103px)',
            transform: 'translateX(-18px)',
            width: '46px',
            marginBottom: '11px',
            opacity: 0,
          }),
          group([
            animate('300ms 50ms linear', style({
              transform: 'translateX(0)',
            })),
            sequence([
              animate('50ms ease', style({ opacity: 1 })),
              animate('300ms 100ms ease-out', style({
                width: '*',
                marginBottom: '*',
              })),
            ])
          ]),
        ]),
        query('.js-animation-content', [
          style({ opacity: 0, transform: 'translateX(-10px)' }),
          animate('300ms 500ms cubic-bezier(0.0, 0.0, 0.2, 1)', style('*')),
        ]),
      ]),
    ]),
    transition('* => void', [
      query('.js-animation-content', [
        animate('80ms ease-out', style({ opacity: 0, transform: 'translateY(-10px)' })),
      ]),
      group([
        query('.js-trigger-element', [
          style('*'),
          sequence([
            animate('200ms 50ms cubic-bezier(0.4, 0.0, 0.2, 1)', style({
              transform: 'translate(-18px, 104px)',
              width: '46px',
              marginBottom: '11px',
            })),
            animate('150ms ease-in-out', style({ opacity: 0 })),
          ]),
        ]),
        query('.background', [
          style('*'),
          group([
            animate('350ms 80ms ease-out', style({
              width: '88px',
              transform: 'translateY(167px)',
            })),
            animate('150ms 200ms ease-out', style({ opacity: 0 })),
          ]),
        ]),
      ])
    ])
  ])
];
