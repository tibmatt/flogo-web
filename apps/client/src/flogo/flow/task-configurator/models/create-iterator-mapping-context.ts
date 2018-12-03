import { ValueType } from '@flogo-web/client/core';

export const ITERABLE_VALUE_KEY = 'iterate';

export function createIteratorMappingContext(iterableValue: string) {
  return {
    inputContext: [
      {
        name: ITERABLE_VALUE_KEY,
        type: ValueType.Any,
      },
    ],
    mappings: [
      {
        mapTo: ITERABLE_VALUE_KEY,
        value: iterableValue,
      },
    ],
  };
}
