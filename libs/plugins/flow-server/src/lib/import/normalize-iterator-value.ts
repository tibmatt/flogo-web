import { isString } from 'lodash';
import { resolveExpressionType } from '@flogo-web/parser';

const shouldAddPrefix: (string) => boolean = (expression: string) => {
  const expressionType = resolveExpressionType(expression);
  /**
   * Need to prefix if the expression is 'attrAccess' then only if it starts with '$' otherwise,
   * for all values which are not of literal type
   */
  return !(
    expressionType === 'literal' ||
    (expressionType === 'attrAccess' && !expression.startsWith('$'))
  );
};

export function normalizeIteratorValue(value: any): any {
  if (isString(value) && value.startsWith('=')) {
    return value;
  }
  const stringedValue = isString(value) ? value : JSON.stringify(value, null, 2);
  return shouldAddPrefix(stringedValue) ? '=' + stringedValue : value;
}
