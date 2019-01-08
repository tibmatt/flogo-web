import { ResourceHooks, BeforeUpdateHookParams, Resource, ValidationError, ResourceExportContext, } from '@flogo-web/server/core';
import { validateFlowData } from './validation';
import { FlowData } from './flow-data';
import { exportFlow } from './export';

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

  async beforeExport(resource: Resource<FlowData>, context: ResourceExportContext) {
    return Promise.resolve(exportFlow(resource, context));
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
