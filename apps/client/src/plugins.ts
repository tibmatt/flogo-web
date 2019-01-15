import { Route } from '@angular/router';

export const resourceRoutes: Route[] = [
  {
    path: 'flow',
    loadChildren: '@flogo-web/plugins/flow-client#FlowModule',
  },
];
