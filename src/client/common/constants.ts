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

/**
 * Defined in modules
 */

export * from '../app/flogo.flows.detail.diagram/constants';
