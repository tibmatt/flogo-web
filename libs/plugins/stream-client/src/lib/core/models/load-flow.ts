import { uniq, fromPairs } from 'lodash';
import { SubscribableOrPromise, Observable, from, of } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';

import { Resource, ApiResource } from '@flogo-web/core';
import { Dictionary, TriggerHandler } from '@flogo-web/lib-client/core';

export const loadFlow = (
  fetchSubflows: (ids: string[]) => Observable<ApiResource[]>,
  convertToWebFlowModel,
  resource
) => {
  return getSubflows(fetchSubflows, resource).pipe(
    switchMap(linkedSubflows => {
      return from(convertToWebFlowModel(resource, linkedSubflows)).pipe(
        map(convertedFlow => ({
          convertedFlow,
          linkedSubflows,
        }))
      );
    }),
    map(({ convertedFlow, linkedSubflows }) => {
      const flowTriggers = resource.triggers || [];
      const { triggers, handlers } = normalizeTriggersAndHandlersForAction(
        resource.id,
        flowTriggers
      );
      return {
        convertedFlow,
        linkedSubflows,
        triggers,
        handlers,
        flowTriggers,
      };
    })
  );
};

function normalizeTriggersAndHandlersForAction(actionId: string, originalTriggers) {
  const triggers: Dictionary<any> = {};
  const handlers: Dictionary<TriggerHandler> = {};
  const findHandlerForAction = (handler: TriggerHandler) =>
    handler.resourceId === actionId;
  originalTriggers.forEach(trigger => {
    triggers[trigger.id] = trigger;
    const handler = trigger.handlers.find(findHandlerForAction);
    handlers[trigger.id] = { ...handler, triggerId: trigger.id };
  });
  return { triggers, handlers };
}

function getSubflowIds(flowData): string[] {
  const allTasks = ((flowData && flowData.tasks) || []).concat(
    flowData.errorHandler && flowData.errorHandler.tasks
      ? flowData.errorHandler.tasks
      : []
  );
  const subFlowTasks = allTasks.filter(t => t.type === 4);
  return uniq<string>(subFlowTasks.map(t => (t.settings || {}).flowPath));
}

function getSubflows(
  fetchSubflows: (ids: string[]) => SubscribableOrPromise<Resource[]>,
  fromResource
): Observable<{ [subflowId: string]: Resource }> {
  const subflowIds = getSubflowIds(fromResource.data);
  const source = subflowIds.length > 0 ? from(fetchSubflows(subflowIds)) : of([]);
  return source.pipe(
    map((subflows: Resource[]) => {
      return fromPairs(subflows.map(a => [a.id, a]) as [string, Resource][]);
    })
  );
}
