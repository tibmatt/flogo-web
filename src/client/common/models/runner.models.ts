import * as engine from './engine.models';

export interface Step {
  flow: {
    attributes: [{
      name: string;
      // todo: limit types
      type: string;
      value: null;
    }],
    // todo: what's the difference between state and status?
    state: number;
    status: number;
  };
  id: string;
  taskId: number;
  // todo: what's this?
  tasks: any;
}

export interface Snapshot {
  // todo
  attrs: any[];
  flowUri: string;
  id: string;
  rootTaskEnv: RootTaskEnv;
  state: number;
  status: number;
  workQueue: WorkQueueItem[];
}

export interface RootTaskEnv {
  id?: number;
  taskId?: number;
  // todo: detail instead of any
  linkDatas?: engine.Link[];
  taskDatas?: TaskDatum[];
}

export interface WorkQueueItem {
  id: number;
  taskID: number;
  code: number;
  execType: number;
}

export interface TaskDatum {
  // tod: detail instead of any
  taskId: number;
  done: boolean;
  state: number;
  // todo
  attrs: any[];
}

export interface InterceptorTask {
  id: string;
  inputs: Array<{
    name: string;
    type: string;
    value: any;
  }>;
}

export interface Interceptor {
  tasks: InterceptorTask[];
}

export { flowToJSON_Flow as FlowInfo } from '../models';
