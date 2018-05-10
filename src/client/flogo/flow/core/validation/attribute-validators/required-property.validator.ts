import { isEmpty } from 'lodash';
import { ItemTask } from '@flogo/core';
import { findValueForProperty } from '../../models/utils';

export function requiredPropertyValidator(propertyName: string) {
  return function(item: ItemTask) {
    const value = findValueForProperty(propertyName, item);
    return isEmpty(value) ? { required: true } : null;
  };
}
