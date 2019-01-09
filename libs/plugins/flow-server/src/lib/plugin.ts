import {
  ResourceHooks,
  BeforeUpdateHookParams,
  Resource,
  ValidationError,
} from '@flogo-web/server/core';
import { validateFlowData } from './validation';

interface FlowData extends Resource {
  tasks: any[];
  // for test purposes
  // todo: remove
  internalInfo: string;
}

export class FlowResourceHooks implements ResourceHooks<FlowData> {
  async beforeCreate(flowResource: Partial<Resource<FlowData>>) {
    runValidation(flowResource.data);
    return Promise.resolve(flowResource);
  }

  async onImport(data: object) {
    return data as Resource<FlowData>;
  }

  async beforeUpdate(params: BeforeUpdateHookParams<FlowData>) {
    const { updatedResource } = params;
    runValidation(updatedResource.data);
    return updatedResource;
  }

  async beforeExport(resource: Resource<FlowData>) {
    return resource;
  }

  async beforeList(resource: Resource<FlowData>) {
    return resource;
  }
}

function runValidation(data: FlowData) {
  const errors = validateFlowData(data);
  if (errors) {
    throw new ValidationError('Flow data validation errors', errors);
  }
}
