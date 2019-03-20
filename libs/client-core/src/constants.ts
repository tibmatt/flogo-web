/**
 * Enumerations
 */

export enum FLOGO_CONTRIB_TYPE {
  TRIGGER = 'trigger',
  ACTIVITY = 'activity',
  FUNCTION = 'function',
}

export enum FLOGO_CONTRIB_TYPE_VALUES {
  MICRO_SERVICE_ACTIVITY = 'flogo:activity',
  MICRO_SERVICE_FUNCTION = 'flogo:function',
}

export enum FLOGO_TASK_TYPE {
  TASK_ROOT, // this is the type for triggers
  TASK = 1,
  TASK_ITERATOR = 2,
  TASK_BRANCH,
  TASK_SUB_PROC,
}

export enum FLOGO_FLOW_DIAGRAM_NODE_TYPE {
  NODE_PADDING, // padding node
  NODE_HOLDER, // placeholder node
  NODE_ADD, // node to add an activity
  NODE_ROOT, // the trigger node
  NODE_ROOT_NEW, // node to add a trigger
  NODE, // activity node
  NODE_BRANCH, // the branch line node
  NODE_LINK, // the link node
  NODE_SUB_PROC, // activity with sub flow
  NODE_LOOP, // repeatable activity
  NODE_ROOT_ERROR_NEW,
}

export enum FLOGO_FLOW_DIAGRAM_FLOW_LINK_TYPE {
  DEFAULT,
  BRANCH,
  LABELED,
}

export enum ValueType {
  String = 'string',
  Integer = 'integer',
  Long = 'long',
  Double = 'double',
  Boolean = 'boolean',
  Object = 'object',
  Array = 'array',
  Any = 'any',
  Params = 'params',
  ComplexObject = 'complexObject',
  Bytes = 'bytes',
}

const _allTypes: ReadonlyArray<ValueType> = Object.values(ValueType);
const _defaultValuesForValueTypes: [ValueType, any][] = [
  [ValueType.String, ''],
  [ValueType.Integer, 0],
  [ValueType.Long, 0],
  [ValueType.Double, 0.0],
  [ValueType.Boolean, false],
  [ValueType.Object, null],
  [ValueType.Array, []],
  [ValueType.Params, null],
  [ValueType.Any, null],
  [ValueType.ComplexObject, null],
  [ValueType.Bytes, ''],
];

export namespace ValueType {
  export const allTypes = _allTypes;
  export const defaultValueForType = new Map<ValueType, any>(_defaultValuesForValueTypes);
}

/**
 * Constants
 */

export const FLOGO_ERROR_ROOT_NAME = '__error-trigger';

export const ERROR_CODE = {
  REQUIRED: 'RequiredProperty',
  UNIQUE: 'UniqueValue',
  NOT_INSTALLED_TRIGGER: 'notInstalledTrigger',
  NOT_INSTALLED_ACTIVITY: 'notInstalledActivity',
  WRONG_INPUT_JSON_FILE: 'wrongInputJSONFile',
  HAS_SUBFLOW: 'HasSubflow',
};

export const ERROR_CONSTRAINT = {
  NOT_UNIQUE: 'notUnique',
  NOT_INSTALLED_TRIGGER: 'notInstalledTrigger',
  NOT_INSTALLED_ACTIVITY: 'notInstalledActivity',
  WRONG_INPUT_JSON_FILE: 'wrongInputJSONFile',
};

export const TRIGGER_MENU_OPERATION = {
  SHOW_SETTINGS: 'show-settings',
  DELETE: 'delete',
};

export const TYPE_ATTR_ASSIGNMENT = 1;
export const TYPE_LITERAL_ASSIGNMENT = 2;
export const TYPE_EXPRESSION_ASSIGNMENT = 3;
export const TYPE_OBJECT_TEMPLATE = 4;
export const MAPPING_TYPE = {
  ATTR_ASSIGNMENT: TYPE_ATTR_ASSIGNMENT,
  LITERAL_ASSIGNMENT: TYPE_LITERAL_ASSIGNMENT,
  EXPRESSION_ASSIGNMENT: TYPE_EXPRESSION_ASSIGNMENT,
  OBJECT_TEMPLATE: TYPE_OBJECT_TEMPLATE,
};
