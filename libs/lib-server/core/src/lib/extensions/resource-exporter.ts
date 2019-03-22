import { Resource, FlogoAppModel, Handler, ContributionSchema } from '@flogo-web/core';
import { AppImportsAgent } from './app-imports-agent';

export interface ResourceExportContext {
  contributions: Map<string, ContributionSchema>;
  resourceIdReconciler: Map<string, Resource>;
  importsAgent: AppImportsAgent;
}

export interface HandlerExportContext {
  triggerSchema: ContributionSchema;
  resource: FlogoAppModel.Resource;
  internalHandler: Handler;
  importsAgent: AppImportsAgent;
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
