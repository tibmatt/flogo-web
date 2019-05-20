import { Trigger } from '@flogo-web/core';
import { Dictionary, TriggerHandler } from '@flogo-web/lib-client/core';
import { RenderableTrigger } from '../interfaces/renderable-trigger';

export function triggersToRenderableTriggers(
  handlers: Dictionary<TriggerHandler>,
  triggers: Dictionary<Trigger>
): RenderableTrigger[] {
  return Object.values(handlers).map(handler => ({
    ...triggers[handler.triggerId],
    handler,
  }));
}
