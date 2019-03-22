import { ValueType } from '@flogo-web/client/core';
import { EXPR_PREFIX } from '@flogo-web/core';

export const CONDITION_KEY = 'condition';

export function createBranchMappingContext(
  condition: string
): { propsToMap: any[]; mappings: any } {
  const propsToMap = [
    {
      name: CONDITION_KEY,
      type: ValueType.Boolean,
    },
  ];
  const mappings = {};
  mappings[CONDITION_KEY] = EXPR_PREFIX + condition;

  return { mappings, propsToMap };
}
