import { isUndefined } from 'lodash';
import { FLOGO_TASK_TYPE, Item, ItemTask } from '@flogo/core';

export const itemIsTask = (item: Item): item is ItemTask => item.type === FLOGO_TASK_TYPE.TASK;

export function findValueForProperty(propertyName: string, item: ItemTask) {
  // during engine execution input mappings will override input settings
  let value = findValueInInputMappings(propertyName, item);
  if (isUndefined(value)) {
    value = findValueInInputs(propertyName, item);
  }
  return value;
}

export function findValueInInputs(propertyName: string, item: ItemTask) {
  const input = (item || <any>{}).input || {};
  return input[propertyName];
}

export function findValueInInputMappings(propertyName: string, item: ItemTask) {
  const mappings = (item || <any>{}).inputMappings || [];
  const mapping = mappings.find(m => m.mapTo === propertyName);
  let value;
  if (mapping) {
    value = mapping.value;
  }
  return value;
}
