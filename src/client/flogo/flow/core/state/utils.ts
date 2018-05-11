import { HandlerType } from '@flogo/flow/core/models';

export const getItemsDictionaryName = (handlerType: HandlerType) => `${handlerType}Items`;

export const getGraphName = (handlerType: HandlerType) => `${handlerType}Graph`;

export type PayloadOf<T extends { payload: any }> = T['payload'];
