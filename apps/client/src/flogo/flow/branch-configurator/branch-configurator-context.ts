import { ValueType } from '@flogo-web/client/core';

export const CONDITION_KEY = 'condition';

export function createBranchMappingContext(
  condition: string
): { propsToMap: any[]; mappings: any[] } {
  let propsToMap = [];
  let mappings = [];
  propsToMap = [
    {
      name: CONDITION_KEY,
      type: ValueType.Boolean,
    },
  ];

  mappings = [
    {
      type: ValueType.Boolean,
      mapTo: CONDITION_KEY,
      value: condition,
    },
  ];

  return { mappings, propsToMap };
}
