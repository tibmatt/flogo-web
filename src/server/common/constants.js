export const REF_SUBFLOW = 'github.com/TIBCOSoftware/flogo-contrib/activity/subflow';
export const LEGACY_FLOW_TYPE = 1;

export const FLOGO_FLOW_DIAGRAM_NODE_TYPE = {
  0: "NODE_PADDING",
  1: "NODE_HOLDER",
  2: "NODE_ADD",
  3: "NODE_ROOT",
  4: "NODE_ROOT_NEW",
  5: "NODE",
  6: "NODE_BRANCH",
  7: "NODE_LINK",
  8: "NODE_SUB_PROC",
  9: "NODE_LOOP",
  10: "NODE_ROOT_ERROR_NEW",
  "NODE_PADDING": 0,   // padding node
  "NODE_HOLDER": 1,    // placeholder node
  "NODE_ADD": 2,       // node to add an activity
  "NODE_ROOT": 3,      // the trigger node
  "NODE_ROOT_NEW": 4,  // node to add a trigger
  "NODE": 5,           // activity node
  "NODE_BRANCH": 6,    // the branch line node
  "NODE_LINK": 7,      // the link node
  "NODE_SUB_PROC": 8,  // activity with sub flow
  "NODE_LOOP": 9,       // repeatable activity
  "NODE_ROOT_ERROR_NEW":10
};

export const FLOGO_PROFILE_TYPES = {
  0: "MICRO_SERVICE",
  1: "DEVICE",
  "MICRO_SERVICE": 0,
  "DEVICE": 1,
};

export const FLOGO_TASK_TYPE = {
  0: "TASK_ROOT",
  1: "TASK",
  2: "TASK_ITERATOR",
  3: "TASK_BRANCH",
  4: "TASK_SUB_PROC",
  "TASK_ROOT": 0,
  "TASK": 1,
  "TASK_ITERATOR": 2,
  "TASK_BRANCH": 3,
  "TASK_SUB_PROC": 4,
};

export const FLOGO_PROCESS_TYPE = {
  1: "DEFAULT",
  "DEFAULT": 1
};

export const FLOGO_FLOW_DIAGRAM_FLOW_LINK_TYPE = {
  0: "DEFAULT",
  1: "BRANCH",
  2: "LABELED",
  "DEFAULT": 0,
  "BRANCH": 1,
  "LABELED": 2
};


export const FLOGO_TASK_ATTRIBUTE_TYPE = {
  STRING: 'string',
  INTEGER: 'integer',
  DOUBLE: 'double',
  BOOLEAN: 'boolean',
  OBJECT: 'object',
  ARRAY: 'array',
  PARAMS: 'params',
  ANY: 'any',
  LONG: 'long',
  COMPLEX_OBJECT: 'complexObject',
};

export const FLOGO_ENGINE_STATUS = {
  '0' : 'ADDING_MODEL',
  '1' : 'ADDING_ACTIVITY',
  '2' : 'ADDING_TRIGGER',
  '3' : 'ADDING_FLOW',
  '4' : 'REMOVING_MODEL',
  '5' : 'REMOVING_ACTIVITY',
  '6' : 'REMOVING_TRIGGER',
  '7' : 'REMOVING_FLOW',
  '8' : 'UPDATING_CONFIG_JSON',
  '9' : 'UPDATING_TRIGGER_JSON',
  '10' : 'BUILDING',
  '11' : 'STARTING',
  '12' : 'STOPPING',
  '13' : 'CREATING',
  '14' : 'REMOVING',
  '15' : 'STOPPED',
  '16' : 'STARTED',
  '17' : 'CREATED',
  '18' : 'REMOVED',
  ADDING_MODEL : 0,
  ADDING_ACTIVITY : 1,
  ADDING_TRIGGER : 2,
  ADDING_FLOW : 3,
  REMOVING_MODEL : 4,
  REMOVING_ACTIVITY : 5,
  REMOVING_TRIGGER : 6,
  REMOVING_FLOW : 7,
  UPDATING_CONFIG_JSON : 8,
  UPDATING_TRIGGER_JSON : 9,
  BUILDING : 10,
  STARTING : 11,
  STOPPING : 12,
  CREATING : 13,
  REMOVING : 14,
  STOPPED : 15,
  STARTED : 16,
  CREATED : 17,
  REMOVED : 18
};


export const TYPE_TRIGGER = 'trigger';
export const TYPE_ACTIVITY = 'activity';
export const TYPE_UNKNOWN = 'unknown';

export const SCHEMA_FILE_NAME_TRIGGER = 'trigger.json';
export const SCHEMA_FILE_NAME_ACTIVITY = 'activity.json';

export const DEFAULT_PATH_TRIGGER = 'packages/triggers';
export const DEFAULT_PATH_ACTIVITY = 'packages/activities';

export const DEFAULT_SCHEMA_ROOT_FOLDER_NAME = 'ui';

export const DEFAULT_APP_ID = 'DEFAULT-APP';
export const DEFAULT_APP_VERSION = '0.0.1';
export const DEFAULT_APP_TYPE = 'flogo:app';

export const TASK_HANDLER_NAME_ROOT = 'rootTask';
export const TASK_HANDLER_NAME_ERROR = 'errorHandlerTask';
