import { Resource, FlogoAppModel, Handler, ContributionSchema } from '@flogo-web/core';
import { AppImportsAgent } from './app-imports-agent';

export interface BaseExportContext {
  importsAgent: AppImportsAgent;
}

export interface ResourceExportContext extends BaseExportContext {
  contributions: Map<string, ContributionSchema>;
  resourceIdReconciler: Map<string, Resource>;
}

export interface HandlerExportContext extends BaseExportContext {
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
