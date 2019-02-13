import {
  ResourceHooks,
  BeforeUpdateHookParams,
  Resource,
  ValidationError,
  ResourceImportContext,
  ResourceExportContext,
} from '@flogo-web/server/core';

import { createActionImporter } from './import';
import { validateFlowData } from './validation';
import { FlowData } from './flow';
import { exportFlow } from './export';

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

  beforeExport(resource: Resource<FlowData>, context: ResourceExportContext) {
    return exportFlow(resource, context);
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
