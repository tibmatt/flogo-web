import { Trigger, Resource } from '@flogo-web/core';
import { ResourcePluginManifest, Dictionary } from '@flogo-web/client-core';

import { ResourceWithPlugin } from './resource-with-plugin';
import { TriggerGroup } from './trigger-group.interface';
import { FlowGroup } from './flow-group.interface';

export const resourceAndPluginMerger = (plugins: ResourcePluginManifest[]) => {
  const pluginsInfo: Dictionary<ResourcePluginManifest> = plugins.reduce(
    (resources, resource) => {
      resources[resource.type] = resource;
      return resources;
    },
    {}
  );
  return (resource: Resource): ResourceWithPlugin => {
    return { ...resource, pluginInfo: pluginsInfo[resource.type] };
  };
};
export const sortableName = r => (r && r.name ? r.name.toLocaleLowerCase() : '');

export function groupByTrigger(
  triggers: Trigger[],
  resources: ResourceWithPlugin[]
): FlowGroup[] {
  let handlers = [];
  triggers.forEach(t => {
    handlers = handlers.concat(t.handlers);
  });
  const orphanActions = resources.filter(a => !handlers.find(h => h.actionId === a.id));
  const orphanActionMap = new Map(<[string, any][]>orphanActions.map(a => [a.id, a]));
  const actionMap = new Map(<[string, any][]>resources.map(a => [a.id, a]));

  const pullAction = actionId => {
    const action = actionMap.get(actionId);
    return action;
  };

  const triggerGroups = triggers
    .map(trigger => {
      return {
        trigger: trigger,
        flows: trigger.handlers.map(h => pullAction(h.actionId)).filter(flow => !!flow),
      };
    })
    .filter(triggerGroup => triggerGroup.flows.length > 0);

  // orphan flows
  if (orphanActionMap.size) {
    triggerGroups.unshift({
      trigger: null,
      flows: Array.from(orphanActionMap.values()),
    });
  }

  return triggerGroups;
}

export function groupByResource(
  triggers: Trigger[],
  resources: ResourceWithPlugin[]
): TriggerGroup[] {
  return resources
    .map(resource => {
      return {
        flow: resource,
        triggers: triggers.filter(
          t => !!t.handlers.find(h => h.actionId === resource.id)
        ),
      };
    })
    .map(resourceGroup => {
      resourceGroup.triggers =
        resourceGroup.triggers.length > 0 ? resourceGroup.triggers : null;
      return resourceGroup;
    });
}
