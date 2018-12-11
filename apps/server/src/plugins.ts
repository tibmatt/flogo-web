import { ResourceRegistrarFn, Resource } from '@flogo-web/server/core';
import { loadFlowResourcePlugin } from '@flogo-web/plugins/flow-server';

export function loadPlugins(registerPlugin: ResourceRegistrarFn) {
  loadFlowResourcePlugin(registerPlugin);
  registerPlugin(mockPlugin());
}

function mockPlugin() {
  return {
    resourceType: 'test',
    resourceHooks: class {
      async beforeList(resource: Resource<{ isThisATest: string }>) {
        return {
          ...resource,
          data: {
            ...resource.data,
            decoratedData: {
              isThisATest: 'yes',
            },
          },
        };
      }
    } as any,
  };
}
