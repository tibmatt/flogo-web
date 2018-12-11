export const REF_SUBFLOW = 'github.com/TIBCOSoftware/flogo-contrib/activity/subflow';
export const REF_TRIGGER_LAMBDA = 'github.com/TIBCOSoftware/flogo-contrib/trigger/lambda';
export const LEGACY_FLOW_TYPE = 1;

export const EXPORT_MODE = {
  STANDARD_MODEL: 'standard',
  LEGACY_MODEL: 'legacy',
  FORMAT_FLOWS: 'flows',
};

export const FLOGO_TASK_TYPE = {
  0: 'TASK_ROOT',
  1: 'TASK',
  2: 'TASK_ITERATOR',
  3: 'TASK_BRANCH',
  4: 'TASK_SUB_PROC',
  TASK_ROOT: 0,
  TASK: 1,
  TASK_ITERATOR: 2,
  TASK_BRANCH: 3,
  TASK_SUB_PROC: 4,
};

export const FLOGO_FLOW_DIAGRAM_FLOW_LINK_TYPE = {
  0: 'DEFAULT',
  1: 'BRANCH',
  2: 'LABELED',
  DEFAULT: 0,
  BRANCH: 1,
  LABELED: 2,
};

export const FLOGO_TASK_ATTRIBUTE_TYPE = {
  STRING: 'string',
  INTEGER: 'integer',
  LONG: 'long',
  DOUBLE: 'double',
  BOOLEAN: 'boolean',
  OBJECT: 'object',
  ARRAY: 'array',
  PARAMS: 'params',
  ANY: 'any',
  COMPLEX_OBJECT: 'complexObject',
};

export const FLOGO_ENGINE_STATUS = {
  '0': 'ADDING_MODEL',
  '1': 'ADDING_ACTIVITY',
  '2': 'ADDING_TRIGGER',
  '3': 'ADDING_FLOW',
  '4': 'REMOVING_MODEL',
  '5': 'REMOVING_ACTIVITY',
  '6': 'REMOVING_TRIGGER',
  '7': 'REMOVING_FLOW',
  '8': 'UPDATING_CONFIG_JSON',
  '9': 'UPDATING_TRIGGER_JSON',
  '10': 'BUILDING',
  '11': 'STARTING',
  '12': 'STOPPING',
  '13': 'CREATING',
  '14': 'REMOVING',
  '15': 'STOPPED',
  '16': 'STARTED',
  '17': 'CREATED',
  '18': 'REMOVED',
  ADDING_MODEL: 0,
  ADDING_ACTIVITY: 1,
  ADDING_TRIGGER: 2,
  ADDING_FLOW: 3,
  REMOVING_MODEL: 4,
  REMOVING_ACTIVITY: 5,
  REMOVING_TRIGGER: 6,
  REMOVING_FLOW: 7,
  UPDATING_CONFIG_JSON: 8,
  UPDATING_TRIGGER_JSON: 9,
  BUILDING: 10,
  STARTING: 11,
  STOPPING: 12,
  CREATING: 13,
  REMOVING: 14,
  STOPPED: 15,
  STARTED: 16,
  CREATED: 17,
  REMOVED: 18,
};

export const MAPPING_EXPRESSION_TYPE = {
  ASSIGN: 1,
  LITERAL: 2,
  EXPRESSION: 3,
  OBJECT: 4,
  ARRAY: 5,
};

export const TYPE_TRIGGER = 'trigger';
export const TYPE_ACTIVITY = 'activity';
export const TYPE_UNKNOWN = 'unknown';

export const DEFAULT_APP_VERSION = '0.0.1';
export const DEFAULT_APP_TYPE = 'flogo:app';

export const TASK_HANDLER_NAME_ROOT = 'rootTask';
export const TASK_HANDLER_NAME_ERROR = 'errorHandler';

// The below constant must be in sync with the client side TYPE_LITERAL_ASSIGNMENT
// [src/client/flogo/flow/shared/mapper/constants.ts]
export const TYPE_LITERAL_ASSIGNMENT = 2;
