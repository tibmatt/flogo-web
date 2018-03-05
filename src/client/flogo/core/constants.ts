/**
 * Enumerations
 */

export enum FLOGO_PROFILE_TYPE {
  MICRO_SERVICE,
  DEVICE
}

export enum FLOGO_TASK_TYPE {
  TASK_ROOT,  // this is the type for triggers
  TASK = 1,
  TASK_ITERATOR = 2,
  TASK_BRANCH,
  TASK_SUB_PROC,
}

export enum FLOGO_PROCESS_TYPE { DEFAULT = 1 }

// can be simplified using string enums in typescript >= 2.1
export namespace ValueTypes {
  export type ValueType = 'string' | 'integer' | 'int' | 'number' | 'boolean' | 'object' | 'array' | 'params' | 'any' |  'complex_object';

  export const STRING: 'string' = 'string';
  export const INTEGER: 'integer' = 'integer';
  // todo: should be removed? only used by device activities
  export const INT: 'int' = 'int';
  export const NUMBER: 'number' = 'number';
  export const BOOLEAN: 'boolean' = 'boolean';
  export const OBJECT: 'object' = 'object';
  export const ARRAY: 'array' = 'array';
  export const ANY: 'any' = 'any';
  export const PARAMS: 'params' = 'params';
  export const COMPLEX_OBJECT: 'complex_object' = 'complex_object';

  export const allTypes: ReadonlyArray<ValueType> = [ STRING, INTEGER, NUMBER, BOOLEAN, OBJECT, ARRAY, ANY, PARAMS, COMPLEX_OBJECT ];

  // can be type safe in typescript >= 2.1 using "keyof" keyword
  export const defaultValueForType = new Map<ValueType, any>([
    [STRING, ''],
    [INTEGER, 0],
    [INT, 0],
    [NUMBER, 0.0],
    [BOOLEAN, false],
    [OBJECT, null],
    [ARRAY, []],
    [PARAMS, null],
    [ANY, null],
    [COMPLEX_OBJECT, null],
  ]);

}

/**
 * Constants
 */

export const FLOGO_PROCESS_MODELS = {
  'DEFAULT': 'simple'
};

/**
 * Defined in modules
 */

export const FLOGO_ERROR_ROOT_NAME = '__error-trigger';

export * from '../flow/shared/diagram/constants';
export { REGEX_INPUT_VALUE_EXTERNAL as FLOGO_AUTOMAPPING_FORMAT } from '../flow/shared/mapper/constants';

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
  CONFIGURE: 'configure',
  DELETE: 'delete'
};

const APP_MODEL_LEGACY: 'legacy' = 'legacy';
const APP_MODEL_STANDARD: 'standard' = 'standard';
export const APP_MODELS = {
  LEGACY: APP_MODEL_LEGACY,
  STANDARD: APP_MODEL_STANDARD,
};
export type TYPE_APP_MODEL = typeof APP_MODEL_LEGACY | typeof APP_MODEL_STANDARD;
