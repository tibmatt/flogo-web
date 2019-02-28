import {
  ResourceImportContext,
  ResourceExportContext,
  ResourcePlugin,
} from '@flogo-web/server/core';

import { createActionImporter } from './import';
import { FlowData } from './flow';
import { exportFlow } from './export';
import { resourceHooks } from './hooks';

export function flowPlugin(): ResourcePlugin<FlowData> {
  return {
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
      resource(resource, context: ResourceExportContext) {
        return exportFlow(resource, context);
      },
      handler(handler) {
        // todo
        return handler as any;
      },
    },
    hooks: {
      resource: resourceHooks,
    },
  };
}
