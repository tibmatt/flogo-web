import { Resource, FlogoAppModel, Handler, ContributionSchema } from '@flogo-web/core';

export interface ResourceExportContext {
  contributions: Map<string, ContributionSchema>;
  resourceIdReconciler: Map<string, Resource>;
}

export interface HandlerExportContext {
  triggerSchema: ContributionSchema;
  resource: FlogoAppModel.Resource;
  internalHandler: Handler;
}

export interface ResourceExporter<TResourceData = unknown> {
  resource(
    resource: Resource<TResourceData>,
    context: ResourceExportContext
  ): FlogoAppModel.Resource;
  handler(
    handler: FlogoAppModel.NewHandler,
    context: HandlerExportContext
  ): FlogoAppModel.NewHandler;
}
