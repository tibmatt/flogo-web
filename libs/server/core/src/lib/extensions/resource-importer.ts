import { Resource, Handler, ContributionSchema, FlogoAppModel } from '@flogo-web/core';

export interface ResourceImportContext {
  contributions: Map<string, ContributionSchema>;
  normalizedTriggerIds: Map<string, string>;
  normalizedResourceIds: Map<string, string>;
  importsTypeToRefAgent: any;
}

export interface HandlerImportContext {
  contributions: Map<string, ContributionSchema>;
  triggerSchema: ContributionSchema;
  rawHandler: FlogoAppModel.Handler;
}

export interface ResourceImporter<TResourceData = unknown> {
  resource(data: any, context: ResourceImportContext): Resource<TResourceData>;
  handler(data: any, context: HandlerImportContext): Handler;
}
