import { FlogoAppModel } from '@flogo-web/core';
import {
  ResourceImportContext,
  ResourceExportContext,
  PluginServer,
  Resource,
  FlogoPlugin,
} from '@flogo-web/server/core';

import { createActionImporter } from './import';
import { exportFlow, exportHandler } from './export';
import { resourceHooks } from './hooks';
import { FlowData } from './flow';
import { FLOW_REF } from './constants';

export const flowPlugin: FlogoPlugin = {
  register(server: PluginServer) {
    server.resources.addType({
      type: 'flow',
      ref: FLOW_REF,
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
        handler(handler: FlogoAppModel.NewHandler, context) {
          return exportHandler(handler, context.internalHandler);
        },
      },
    });
    server.resources.useHooks(resourceHooks);
  },
};
