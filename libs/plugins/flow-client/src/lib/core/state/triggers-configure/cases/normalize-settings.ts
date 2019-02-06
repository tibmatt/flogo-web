import { mapValues } from 'lodash';
import { Dictionary } from '@flogo-web/client-core';

export function normalizeSettings(settings: Dictionary<any>): Dictionary<any> {
  return mapValues(settings, removeExpressionPrefix);
}

const removeExpressionPrefix = (value: any) =>
  /^=/g.test(value) ? value.substr(1) : value;
