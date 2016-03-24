import { IFlogoAttribute, IFlogoAttributeMapping, IFlogoTask } from '../models';

export enum FLOGO_PROCESS_TYPE { DEFAULT };

export interface IFlogoProcess {
  id: string;
  model: string;
  type: FLOGO_PROCESS_TYPE;
  attributes ? : IFlogoAttribute[ ];
  inputMappings ? : IFlogoAttributeMapping[ ];
  rootTasks: IFlogoTask;
};
