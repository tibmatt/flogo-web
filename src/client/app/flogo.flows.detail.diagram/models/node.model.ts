import { IFlogoDiagram } from '../models';

export enum FLOGO_NODE_TYPE { NODE_ADD, NODE_ROOT, NODE, NODE_BRANCH, NODE_LINK, NODE_SUB_PROC, NODE_LOOP };

export interface IFlogoNode {
  id: string; // id of the node
  taskID: string; // id of the task
  type: FLOGO_NODE_TYPE; // type of the node
  children: string[ ]; // ids of the children IFlogoNode
  parents: string[ ]; // ids of the parents IFlogoNode
  subProc ? : IFlogoDiagram[ ]; // [optional] sub process diagram of a task with sub process
};

export interface IFlogoNodeLocation {
  children: string[ ]; // ids of the children IFlogoNode
  parents: string[ ]; // ids of the parents IFlogoNode
};

export interface IFlogoDiagramRootNode {
  is: string; // marking the root node in this dictionary
};
