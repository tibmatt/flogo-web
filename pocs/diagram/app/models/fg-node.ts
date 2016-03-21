import { FGDiagram } from './fg-diagram';

export enum FGNodeType { ROOT, TASK, LINK, BRANCH, SUB_FLOW, TASK_LOOP };

/**
 * The basic node within the diagram.
 * Inside a grid system, it's mapped to a cell of the grid.
 */
export interface FGNode {
  id: string; // id of the node
  taskID: string; // id of the task
  type: FGNodeType; // type of the node
  children: string[ ]; // ids of the children FGNode
  parents: string[ ]; // ids of the parents FGNode
  subflow ? : FGDiagram[ ]; // [optional] subflow diagram of sub-flow task
}

export interface FGNodeLocation {
  children: string[ ]; // ids of the children FGNode
  parents: string[ ]; // ids of the parents FGNode
}
