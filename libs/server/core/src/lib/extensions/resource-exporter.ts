import { Resource, FlogoAppModel, Handler, ContributionSchema } from '@flogo-web/core';

export interface ResourceExportContext {
  contributions: Map<string, ContributionSchema>;
  resourceIdReconciler: Map<string, string>;
}

export interface ResourceExporter<TResourceData = unknown> {
  resource(
    resource: Resource<TResourceData>,
    context: ResourceExportContext
  ): FlogoAppModel.Resource;
  handler(handler: Handler, context: ResourceExportContext): FlogoAppModel.Handler;
}
