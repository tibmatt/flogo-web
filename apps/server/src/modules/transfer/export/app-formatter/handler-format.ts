import { isEmpty } from 'lodash';
import { FlogoAppModel, Trigger, Handler, ContributionSchema } from '@flogo-web/core';
import { HandlerExporterFn } from '../resource-exporter-fn';
import { ExportedResourceInfo } from './exported-resource-info';
import { AppImportsAgent } from '@flogo-web/server/core';

function preFormatHandler(handler: Handler, type: string): FlogoAppModel.NewHandler {
  const { settings, actionMappings } = handler;
  return {
    settings: !isEmpty(settings) ? { ...settings } : undefined,
    action: {
      type,
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
      const formattedHandler = preFormatHandler(
        handler,
        importsAgent.registerRef(resourceInfo.ref)
      );
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
