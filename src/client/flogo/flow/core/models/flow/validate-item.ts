import { fromPairs as objectFromPairs, isEmpty } from 'lodash';
import { ActivitySchema, ContribSchema, Dictionary, Item, ItemTask } from '@flogo/core';
import { isMapperActivity } from '@flogo/shared/utils';

import { createItemValidators, Validator } from '../../validation';
import { itemIsTask } from '../utils';

export function validateOne(schema: ActivitySchema, item: Item) {
  if (!itemIsTask(item) || isMapperActivity(schema)) {
    return null;
  }
  const validators = createItemValidators(schema);
  return applyValidators(validators, item);
}

export function validateAll(schemas: Dictionary<ContribSchema>, items: Dictionary<Item>) {
  const schemaValidatorRegistry = makeSchemaRegistry(schemas);
  return objectFromPairs(
    Object.entries(items)
    .filter(([, item]) => itemIsTask(item))
    .map(([itemId, item]: [string, ItemTask]) => {
      const validators = schemaValidatorRegistry.getValidators(item.ref);
      return [itemId, applyValidators(validators, item)];
    })
    .filter(([, errors]) => !isEmpty(errors))
  );
}

function makeSchemaRegistry(schemas: Dictionary<ContribSchema>) {
  const validatorMap = new Map<string, Validator[]>();
  return {
    getValidators(ref: string) {
      let validator = validatorMap.get(ref);
      if (validator) {
        return validator;
      }
      validator = createItemValidators(<ActivitySchema>schemas[ref]);
      validatorMap.set(ref, validator);
      return validator;
    }
  };
}

function applyValidators(validators: Validator[], item: ItemTask) {
  return objectFromPairs(
    validators
      .map(validator => [validator.propertyName, validator.validate(item)])
      .filter(([, errors]) => !isEmpty(errors))
  );
}
