import { flow, map, filter } from 'lodash/fp';
import {
  parseResourceIdFromResourceUri,
  convertMappingsCollectionToStandard,
} from '@flogo-web/server/core';

import { normalizeHandlerMappings } from '../common/normalize-handler-mappings';
import { normalizeSettingsWithPrefix } from '../common/normalize-settings-with-prefix';

export function importTriggers(
  // todo: triggers interface
  rawTriggers: any[],
  normalizedResourceIds: Map<string, string>,
  generateId: () => string,
  createdAt: string = null
): {
  // todo: triggers interface
  triggers: any[];
  normalizedTriggerIds: Map<string, string>;
} {
  const normalizedTriggerIds = new Map<string, string>();
  const normalizeHandlers = handlerNormalizer(normalizedResourceIds, createdAt);
  const triggers = [];
  rawTriggers.forEach(rawTrigger => {
    const newTrigger = {
      ...rawTrigger,
      id: generateId(),
      name: rawTrigger.name || rawTrigger.id,
      createdAt,
      updatedAt: null,
      settings: normalizeSettingsWithPrefix(rawTrigger.settings)
    };
    const handlers = normalizeHandlers(extractHandlers(rawTrigger));
    triggers.push({ ...newTrigger, handlers });
    normalizedTriggerIds.set(rawTrigger.id, newTrigger.id);
  });
  return {
    triggers,
    normalizedTriggerIds,
  };
}

function handlerNormalizer(
  normalizedResourceIds: Map<string, string>,
  createdAt: string = null
) {
  return flow(
    map((handler: any) => {
      const linkedResourceId = normalizedResourceIds.get(handler.actionId);
      return {
        handler,
        actionId: linkedResourceId || null,
      };
    }),
    filter<{ handler?: any; actionId: string }>(
      reconciledHandler => !!reconciledHandler.actionId
    ),
    map(({ actionId, handler }) => ({
      ...normalizeHandlerMappings(handler),
      settings: normalizeSettingsWithPrefix(handler.settings),
      actionId,
      createdAt,
      outputs: {},
      updatedAt: null,
    }))
  );
}

function extractHandlers(trigger) {
  const standardHandlers = trigger.handlers || [];
  return standardHandlers.map(mapHandler);
}

function mapHandler(stdHandler) {
  const action = stdHandler.action;
  return {
    settings: stdHandler.settings,
    actionId: parseResourceIdFromResourceUri(action.data.flowURI),
    actionMappings: convertMappingsCollectionToStandard(action.mappings),
  };
}
