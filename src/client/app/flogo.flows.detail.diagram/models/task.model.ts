import { IFlogoAttribute, IFlogoAttributeMapping, IFlogoTaskLink } from '../models';

export enum FLOGO_ACTIVITY_TYPE { DEFAULT, LOG, REST };
export const FLOGO_ACTIVITIES = {
  'DEFAULT': '',
  'LOG': 'tibco-log',
  'REST': 'tibco-rest'
};

export enum FLOGO_TASK_TYPE { TASK_ROOT, TASK, TASK_BRANCH, TASK_SUB_PROC, TASK_LOOP };


export interface IFlogoTask {
  id: string;
  type: FLOGO_TASK_TYPE;
  version ? : string;
  name ? : string;
  description ? : string;
  title ? : string;
  activityType ? : FLOGO_ACTIVITY_TYPE;
  attributes ? : {
    inputs ? : IFlogoAttribute[ ];
    outputs ? : IFlogoAttribute[ ];
  };
  inputMappings ? : IFlogoAttributeMapping[ ];
  outputMappings ? : IFlogoAttributeMapping[ ];
  tasks ? : IFlogoTask[ ];
  links ? : IFlogoTaskLink[ ];
};
