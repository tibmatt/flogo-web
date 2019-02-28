import { ResourceRegistrar } from '@flogo-web/server/core';
import { flowPlugin } from '@flogo-web/plugins/flow-server';

interface AppConfigurator {
  resources: ResourceRegistrar;
}

export function loadPlugins(app: AppConfigurator) {
  app.resources.use(flowPlugin());
  // app.resources.use(mockPlugin());
}
