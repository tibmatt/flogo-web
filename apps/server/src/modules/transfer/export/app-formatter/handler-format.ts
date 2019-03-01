import { isEmpty } from 'lodash';
import { FlogoAppModel, Trigger, Handler, ContributionSchema } from '@flogo-web/core';
import { HandlerExporterFn } from '../resource-exporter-fn';
import { ExportedResourceInfo } from './exported-resource-info';

function preFormatHandler(handler: Handler, ref: string): FlogoAppModel.NewHandler {
  const { settings, actionMappings } = handler;
  return {
    settings: !isEmpty(settings) ? { ...settings } : undefined,
    action: {
      // todo
      ref,
      settings: null,
      ...actionMappings,
    },
  };
}

interface HandlerFormatterParams {
  exportHandler: HandlerExporterFn;
  contributionSchemas: Map<string, ContributionSchema>;
  getResourceInfo(oldResourceId): ExportedResourceInfo;
}

export function makeHandlerFormatter({
  exportHandler,
  contributionSchemas,
  getResourceInfo,
}: HandlerFormatterParams) {
  return (trigger: Trigger) => {
    const triggerSchema = contributionSchemas.get(trigger.ref);
    return (handler: Handler) => {
      const resourceInfo = getResourceInfo(handler.resourceId);
      const formattedHandler = preFormatHandler(handler, resourceInfo.ref);
      return exportHandler(resourceInfo.type, formattedHandler, {
        triggerSchema,
        resource: resourceInfo.resource,
        internalHandler: {
          ...handler,
          resourceId: resourceInfo.resource.id,
        },
      });
    };
  };
}
