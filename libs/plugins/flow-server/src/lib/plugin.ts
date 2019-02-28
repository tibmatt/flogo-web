import {
  ResourceImportContext,
  ResourceExportContext,
  PluginServer,
  Resource,
  FlogoPlugin,
} from '@flogo-web/server/core';

import { createActionImporter } from './import';
import { exportFlow } from './export';
import { resourceHooks } from './hooks';
import { FlowData } from './flow';

export const flowPlugin: FlogoPlugin = {
  register(server: PluginServer) {
    server.resources.addType({
      type: 'flow',
      ref: 'github.com/project-flogo/flow',
      import: {
        resource(data, context: ResourceImportContext) {
          const importer = createActionImporter();
          return importer.importAction(data, context);
        },
        handler(handler) {
          // todo
          return handler as any;
        },
      },
      export: {
        resource(resource: Resource<FlowData>, context: ResourceExportContext) {
          return exportFlow(resource, context);
        },
        handler(handler) {
          // todo
          return handler as any;
        },
      },
    });
    server.resources.useHooks(resourceHooks);
  },
};
