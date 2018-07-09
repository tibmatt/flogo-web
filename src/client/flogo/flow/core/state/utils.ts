import { Item } from '@flogo/core';
import { HandlerType } from '@flogo/flow/core/models';
import { FlowState } from './flow/flow.state';

export const getItemsDictionaryName = (handlerType: HandlerType) => `${handlerType}Items`;

export const getGraphName = (handlerType: HandlerType) => `${handlerType}Graph`;

export const getItem = (state: FlowState, handlerType: HandlerType, itemId: string): Item => {
  return state[getItemsDictionaryName(handlerType)][itemId];
};

export type PayloadOf<T extends { payload: any }> = T['payload'];
