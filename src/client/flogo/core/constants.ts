/**
 * Enumerations
 */

export enum FLOGO_PROFILE_TYPE {
  MICRO_SERVICE,
  DEVICE
}

export enum FLOGO_CONTRIB_TYPE {
  TRIGGER = 'trigger',
  ACTIVITY = 'activity'
}

export enum FLOGO_TASK_TYPE {
  TASK_ROOT,  // this is the type for triggers
  TASK = 1,
  TASK_ITERATOR = 2,
  TASK_BRANCH,
  TASK_SUB_PROC,
}

export enum FLOGO_FLOW_DIAGRAM_NODE_TYPE {
  NODE_PADDING,   // padding node
  NODE_HOLDER,    // placeholder node
  NODE_ADD,       // node to add an activity
  NODE_ROOT,      // the trigger node
  NODE_ROOT_NEW,  // node to add a trigger
  NODE,           // activity node
  NODE_BRANCH,    // the branch line node
  NODE_LINK,      // the link node
  NODE_SUB_PROC,  // activity with sub flow
  NODE_LOOP,       // repeatable activity
  NODE_ROOT_ERROR_NEW
}

export enum FLOGO_FLOW_DIAGRAM_FLOW_LINK_TYPE {
  DEFAULT,
  BRANCH,
  LABELED
}

export enum FLOGO_PROCESS_TYPE { DEFAULT = 1 }


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
  ComplexObject = 'complexObject'
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
  HAS_SUBFLOW: 'HasSubflow'
};

export const ERROR_CONSTRAINT = {
  NOT_UNIQUE: 'notUnique',
  NOT_INSTALLED_TRIGGER: 'notInstalledTrigger',
  NOT_INSTALLED_ACTIVITY: 'notInstalledActivity',
  WRONG_INPUT_JSON_FILE: 'wrongInputJSONFile'
};

export const TRIGGER_MENU_OPERATION = {
  SHOW_SETTINGS: 'show-settings',
  DELETE: 'delete'
};


const APP_MODEL_LEGACY: 'legacy' = 'legacy';
const APP_MODEL_STANDARD: 'standard' = 'standard';
export const APP_MODELS = {
  LEGACY: APP_MODEL_LEGACY,
  STANDARD: APP_MODEL_STANDARD,
};
export type TYPE_APP_MODEL = typeof APP_MODEL_LEGACY | typeof APP_MODEL_STANDARD;

export const CONTRIB_REF_PLACEHOLDER = {
  REF_SUBFLOW: 'github.com/TIBCOSoftware/flogo-contrib/activity/subflow',
  REF_LAMBDA: 'github.com/TIBCOSoftware/flogo-contrib/trigger/lambda',
  REF_CLI: 'github.com/TIBCOSoftware/flogo-contrib/trigger/cli'
};

export const SELECTED_INSERT_TILE_CLASS = 'logic-selected';
export const BUTTON_INSERT_CLASS = 'btn-insert';
