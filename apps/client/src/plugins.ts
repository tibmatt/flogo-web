import { ResourcePluginManifest } from '@flogo-web/lib-client/core';

export const resourcePlugins: ResourcePluginManifest[] = [
  {
    label: 'Flow',
    type: 'flow',
    path: 'flow',
    loadChildren: () => import('@flogo-web/plugins/flow-client').then(m => m.FlowModule),
    color: '#96a7f8',
  },
  {
    label: 'Stream',
    type: 'stream',
    path: 'stream',
    loadChildren: () =>
      import('@flogo-web/plugins/stream-client').then(m => m.StreamClientModule),
    color: '#33c6d8',
  },
  {
    label: 'Organic',
    type: 'organic',
    path: 'organic',
    loadChildren: () =>
      import('@flogo-web/plugins/organic-client').then(m => m.OrganicClientModule),
    color: '#2b4d8d',
  },
];
