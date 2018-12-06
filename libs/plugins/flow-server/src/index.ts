import { ResourceHooks, Resource, ResourceRegistrarFn } from '@flogo-web/server/core';

const resourceType = 'flow';

interface FlowData extends Resource {
  tasks: any[];
}

export function loadFlowResourcePlugin(registerPlugin: ResourceRegistrarFn) {
  registerPlugin({
    resourceType,
    resourceHooks: { useClass: FlowResourcePlugin },
  });
}

const resourceHooks = {
  async beforeCreate(flowResource: Resource<FlowData>) {
    return flowResource;
  },
  async onImport(data: object) {
    return data as Resource<FlowData>;
  },
  async beforeUpdate(resource: Resource<FlowData>) {
    return resource;
  },
  async beforeExport(resource: Resource<FlowData>) {
    return resource;
  },
  async beforeList(resource: Resource<FlowData>) {
    return resource;
  },
};

class FlowResourcePlugin implements ResourceHooks<FlowData> {
  async beforeCreate(flowResource: Resource<FlowData>) {
    return flowResource;
  }
  async onImport(data: object) {
    return data as Resource<FlowData>;
  }
  async beforeUpdate(resource: Resource<FlowData>) {
    return resource;
  }
  async beforeExport(resource: Resource<FlowData>) {
    return resource;
  }
  async beforeList(resource: Resource<FlowData>) {
    return resource;
  }
}
