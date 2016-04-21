/**
 * Enumerations
 */

export enum FLOGO_TASK_TYPE {
  TASK_ROOT,  // this is the type for triggers
  TASK,
  TASK_BRANCH,
  TASK_SUB_PROC,
  TASK_LOOP
}

export enum FLOGO_TASK_STATUS {
  DEFAULT,
  RUNNING,
  DONE
}

export enum FLOGO_PROCESS_TYPE { DEFAULT = 1 }

export enum FLOGO_PROCESS_MODEL { DEFAULT }

export enum FLOGO_TASK_ATTRIBUTE_TYPE {
  STRING,
  NUMBER,
  OBJECT,
  BOOLEAN,
  ARRAY,
  PARAM
}

/**
 * Constants
 */

export const FLOGO_PROCESS_MODELS = {
  'DEFAULT' : 'simple'
};

/**
 * Defined in modules
 */

export * from '../app/flogo.flows.detail.diagram/constants';
