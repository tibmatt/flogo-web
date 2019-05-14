import { ResourcePluginManifest } from '@flogo-web/lib-client/core';

export const resourcePlugins: ResourcePluginManifest[] = [
  {
    label: 'Flow',
    type: 'flow',
    path: 'flow',
    loadChildren: '@flogo-web/plugins/flow-client#FlowModule',
    color: '#96a7f8',
  },
  {
    label: 'Stream',
    type: 'stream',
    path: 'stream',
    loadChildren: '@flogo-web/plugins/stream-client#PluginsStreamClientModule',
    color: '#33c6d8',
  },
  // sample data
  // {
  //   label: 'Other',
  //   type: 'other',
  //   path: 'other',
  //   loadChildren: '@flogo-web/plugins/flow-client#FlowModule',
  //   color: '#33c6d8',
  // },
];
