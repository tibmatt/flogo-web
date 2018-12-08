import { ResourceHooks, Resource } from '@flogo-web/server/core';

interface FlowData extends Resource {
  tasks: any[];
  // for test purposes
  // todo: remove
  internalInfo: string;
}

export class FlowResourceHooks implements ResourceHooks<FlowData> {
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
    const data = { ...resource.data };
    delete data.internalInfo;
    return { ...resource, data };
  }
}
