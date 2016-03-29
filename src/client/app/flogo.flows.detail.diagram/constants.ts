/**
 * Enumerations
 */

export enum FLOGO_ACTIVITY_TYPE {
  DEFAULT,
  LOG,
  REST
}

export enum FLOGO_TASK_TYPE {
  TASK_ROOT,
  TASK,
  TASK_BRANCH,
  TASK_SUB_PROC,
  TASK_LOOP
}

export enum FLOGO_PROCESS_TYPE { DEFAULT }

export enum FLOGO_PROCESS_MODEL { DEFAULT }

export enum FLOGO_FLOW_DIAGRAM_NODE_TYPE {
  NODE_ADD,
  NODE_ROOT,
  NODE_ROOT_NEW,
  NODE,
  NODE_BRANCH,
  NODE_LINK,
  NODE_SUB_PROC,
  NODE_LOOP
}

export enum FLOGO_TASK_ATTRIBUTE_TYPE {
  STRING,
  NUMBER,
  OBJECT,
  BOOLEAN,
  ARRAY
}

/**
 * Constants
 */

export const FLOGO_ACTIVITIES = {
  'DEFAULT' : '',
  'LOG' : 'tibco-log',
  'REST' : 'tibco-rest'
};
