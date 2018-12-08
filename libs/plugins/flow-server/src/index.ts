import { ResourceRegistrarFn } from '@flogo-web/server/core';
import { FlowResourceHooks } from './lib/plugin';

export function loadFlowResourcePlugin(registerPlugin: ResourceRegistrarFn) {
  registerPlugin({
    resourceType: 'flow',
    resourceHooks: FlowResourceHooks,
  });
}

