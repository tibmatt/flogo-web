import { IFlogoTask, IFlogoNode } from '../models';

export interface IFlogoTaskDictionary {
  [ index : string ] : IFlogoTask
}

export interface IFlogoNodeDictionary {
  [ index : string ] : IFlogoNode
}
