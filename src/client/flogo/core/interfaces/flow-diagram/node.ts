import { FLOGO_FLOW_DIAGRAM_NODE_TYPE } from '@flogo/flow/shared/diagram/constants';

export interface Node {
  id: string; // id of the node
  taskID ?: string; // id of the task
  type: FLOGO_FLOW_DIAGRAM_NODE_TYPE; // type of the node
  children: string[ ]; // ids of the children Node
  parents: string[ ]; // ids of the parents Node
  // subProc ?: FlowDiagram[ ]; // [optional] sub process diagram of a task with sub process
  __status?: {
    [key: string]: boolean;
  };
}
