import {
  ResourceHooks,
  BeforeUpdateHookParams,
  Resource,
  ValidationError,
  ResourceImportContext,
} from '@flogo-web/server/core';

import { createActionImporter } from './import';
import { validateFlowData } from './validation';
import { FlowData } from './flow';

export class FlowResourceHooks implements ResourceHooks<FlowData> {
  async beforeCreate(flowResource: Partial<Resource<FlowData>>) {
    runValidation(flowResource.data);
    return flowResource;
  }

  async onImport(data: Resource, context: ResourceImportContext) {
    const importer = createActionImporter();
    return importer.importAction(data, context);
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
