import {
  Resource,
  FlogoAppModel,
  Handler,
  ContributionSchema,
  ContributionType,
} from '@flogo-web/core';

export interface ResourceExportContext {
  contributions: Map<string, ContributionSchema>;
  resourceIdReconciler: Map<string, Resource>;
  refAgent: ExportRefAgent;
}

export interface HandlerExportContext {
  triggerSchema: ContributionSchema;
  resource: FlogoAppModel.Resource;
  internalHandler: Handler;
  refAgent: ExportRefAgent;
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

export interface ExportRefAgent {
  getAliasRef(contribType: ContributionType, packageRef: string): string | undefined;
  registerFunctionName(functionName: string): void;
}
