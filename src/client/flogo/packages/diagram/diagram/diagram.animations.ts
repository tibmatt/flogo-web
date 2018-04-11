import { animate, animateChild, query, stagger, style, transition, trigger } from '@angular/animations';

export const diagramAnimations = [
  trigger('list', [
    transition(':enter', [
      // child animation selector + stagger
      query('@items',
        stagger(-100, animateChild())
      )
    ]),
  ]),
  trigger('items', [
    // cubic-bezier for a tiny bouncing feel
    transition(':enter', [
      style({ transform: 'scale(0.7)', opacity: 0 }),
      animate('0.8s cubic-bezier(.8,-0.6,0.2,1.5)',
        style({ transform: 'scale(1)', opacity: 1 }))
    ]),
    transition(':leave', [
      style({ transform: 'scale(1)', opacity: 1, height: '*' }),
      animate('0.8s cubic-bezier(.8,-0.6,0.2,1.5)',
        style({ transform: 'scale(0.5)', opacity: 0, height: '0px', margin: '0px' }))
    ]),
  ])
];
