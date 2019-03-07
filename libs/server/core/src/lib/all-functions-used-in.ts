import { isString, isEmpty } from 'lodash';
import { EXPR_PREFIX } from '@flogo-web/core';
import { parseAndExtractReferences } from '../../../../core/src/lib/mapper/functions';

export function allFunctionsUsedIn(mappings: { [propertyName: string]: any }) {
  const functions = new Set<string>();
  Object.values(mappings).forEach(mapping => {
    if (isString(mapping) && mapping.startsWith(EXPR_PREFIX)) {
      parseAndExtractReferences(mapping.substr(1)).forEach(fn => functions.add(fn));
    }
  });

  return Array.from(functions.values());
}
