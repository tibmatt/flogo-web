import { isEmpty } from 'lodash';
import {
  FlogoAppModel,
  Trigger,
  Handler,
  ContributionSchema,
  MapperUtils,
} from '@flogo-web/core';
import { AppImportsAgent } from '@flogo-web/server/core';
import { HandlerExporterFn } from '../resource-exporter-fn';
import { ExportedResourceInfo } from './exported-resource-info';

interface HandlerFormatterParams {
  exportHandler: HandlerExporterFn;
  contributionSchemas: Map<string, ContributionSchema>;
  importsAgent: AppImportsAgent;
  getResourceInfo(oldResourceId): ExportedResourceInfo;
}

export function makeHandlerFormatter({
  exportHandler,
  contributionSchemas,
  importsAgent,
  getResourceInfo,
}: HandlerFormatterParams) {
  return (trigger: Trigger) => {
    const triggerSchema = contributionSchemas.get(trigger.ref);
    return (handler: Handler) => {
      const resourceInfo = getResourceInfo(handler.resourceId);
      const formattedHandler = preFormatHandler(handler, resourceInfo.ref, importsAgent);
      return exportHandler(resourceInfo.type, formattedHandler, {
        triggerSchema,
        resource: resourceInfo.resource,
        importsAgent,
        internalHandler: {
          ...handler,
          resourceId: resourceInfo.resource.id,
        },
      });
    };
  };
}

function preFormatHandler(
  handler: Handler,
  ref: string,
  refAgent: AppImportsAgent
): FlogoAppModel.NewHandler {
  const { settings, actionMappings } = handler;
  const registerFunctions = (fn: string) => refAgent.registerFunctionName(fn);
  extractFunctions(actionMappings && actionMappings.input).forEach(registerFunctions);
  extractFunctions(actionMappings && actionMappings.output).forEach(registerFunctions);
  return {
    settings: !isEmpty(settings) ? { ...settings } : undefined,
    action: {
      ref: refAgent.registerRef(ref),
      settings: null,
      ...actionMappings,
    },
  };
}

function extractFunctions(mappings: { [name: string]: any }): string[] {
  return !isEmpty(mappings)
    ? MapperUtils.functions.parseAndExtractReferencesInMappings(mappings)
    : [];
}
