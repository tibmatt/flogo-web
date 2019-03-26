import { cloneDeep } from 'lodash';
import { ActivitySchema } from '@flogo-web/core';
import { ItemTask, Task, TaskAttribute } from '@flogo-web/lib-client/core';

export type PartialActivitySchema = Partial<ActivitySchema>;

export function mergeItemWithSchema(item: ItemTask, schema: PartialActivitySchema): Task {
  item = cloneDeep(item);
  schema = cloneDeep(schema);
  const itemInput = item.input || {};
  const schemaInputs = schema.inputs || [];
  const inputs = schemaInputs.map(input => {
    const value = itemInput[input.name];
    return { ...input, value };
  });
  return {
    id: item.id,
    type: item.type,
    version: schema.version,
    name: item.name,
    activityRef: item.ref,
    ref: item.ref,
    description: item.description,
    attributes: {
      inputs,
      outputs: <TaskAttribute[]>schema.outputs,
    },
    activitySettings: item.activitySettings,
    inputMappings: item.inputMappings,
    settings: item.settings,
    __props: {},
    __status: {},
  };
}
