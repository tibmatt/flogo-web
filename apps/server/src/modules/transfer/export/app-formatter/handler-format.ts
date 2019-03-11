import { isEmpty } from 'lodash';
import { FlogoAppModel, Trigger, Handler, ContributionSchema } from '@flogo-web/core';
import { HandlerExporterFn } from '../resource-exporter-fn';
import { ExportedResourceInfo } from './exported-resource-info';
import { AppImportsAgent, allFunctionsUsedIn } from '@flogo-web/server/core';

function preFormatHandler(
  handler: Handler,
  ref: string,
  refAgent: AppImportsAgent
): FlogoAppModel.NewHandler {
  const { settings, actionMappings } = handler;
  allFunctionsUsedIn(actionMappings.input).forEach(fn =>
    refAgent.registerFunctionName(fn)
  );
  allFunctionsUsedIn(actionMappings.output).forEach(fn =>
    refAgent.registerFunctionName(fn)
  );
  return {
    settings: !isEmpty(settings) ? { ...settings } : undefined,
    action: {
      type: refAgent.registerRef(ref),
      settings: null,
      ...actionMappings,
    },
  };
}

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
