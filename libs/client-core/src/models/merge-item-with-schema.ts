import { cloneDeep } from 'lodash';
import { ItemTask, ActivitySchema, Task } from '../interfaces';
import { TaskAttribute } from '..';

export interface PartialActivitySchema {
  version?: ActivitySchema['version'];
  inputs?: ActivitySchema['inputs'];
  outputs?: ActivitySchema['outputs'];
  settings?: ActivitySchema['settings'];
}

export function mergeItemWithSchema(item: ItemTask, schema: PartialActivitySchema): Task {
  item = cloneDeep(item);
  schema = cloneDeep(schema);
  const itemInput = item.input || {};
  const schemaInputs = schema.inputs || [];
  const inputs = schemaInputs.map(input => {
    const value = itemInput[input.name];
    return { ...input, value };
  });
  const activitySettings = schema.settings || [];
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
    activitySettings: activitySettings,
    inputMappings: item.inputMappings,
    settings: item.settings,
    __props: {},
    __status: {},
  };
}
