import { Item, GraphNode } from '@flogo/core';
import { NodeDictionary } from '@flogo/core/interfaces/graph/graph';
import { HandlerType } from '@flogo/flow/core/models';
import { FlowState } from './flow/flow.state';

export const getItemsDictionaryName = (handlerType: HandlerType) => `${handlerType}Items`;

export const getGraphName = (handlerType: HandlerType) => `${handlerType}Graph`;

export const getItem = (state: FlowState, handlerType: HandlerType, itemId: string): Item => {
  return state[getItemsDictionaryName(handlerType)][itemId];
};

export const getNode = (state: FlowState, handlerType: HandlerType, itemId: string): GraphNode => {
  return state[getGraphName(handlerType)][itemId];
};

export const nodesContainErrors = (nodes: NodeDictionary) => {
  const nodeKeys = Object.keys(nodes);
  return !!nodeKeys.find(nodeKey => !!nodes[nodeKey].status.executionErrored);
};
export type PayloadOf<T extends { payload: any }> = T['payload'];
