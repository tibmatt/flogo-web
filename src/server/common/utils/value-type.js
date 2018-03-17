import { FLOGO_TASK_ATTRIBUTE_TYPE } from '../constants';

export function normalizeValueType(type) {
  type = type ? type.toLowerCase() : null;
  switch (type) {
    case 'any':
      return FLOGO_TASK_ATTRIBUTE_TYPE.ANY;
    case 'integer':
    case 'int':
      return FLOGO_TASK_ATTRIBUTE_TYPE.INTEGER;
    case 'long':
      return FLOGO_TASK_ATTRIBUTE_TYPE.LONG;
    case 'double':
    case 'number':
      return FLOGO_TASK_ATTRIBUTE_TYPE.DOUBLE;
    case 'boolean':
    case 'bool':
      return FLOGO_TASK_ATTRIBUTE_TYPE.BOOLEAN;
    case 'complexobject':
    case 'complex_object':
      return FLOGO_TASK_ATTRIBUTE_TYPE.COMPLEX_OBJECT;
    case 'array':
      return FLOGO_TASK_ATTRIBUTE_TYPE.ARRAY;
    case 'params':
      return FLOGO_TASK_ATTRIBUTE_TYPE.PARAMS;
    default:
      return FLOGO_TASK_ATTRIBUTE_TYPE.ANY;
  }
}
