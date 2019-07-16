import {
  BaseResourceState,
  Dictionary,
  Trigger,
  TriggerHandler,
} from '@flogo-web/lib-client/core';

import { Item } from '../interfaces';

export interface StreamStoreState {
  stream: FlogoStreamState;
}

export interface FlogoStreamState extends BaseResourceState<Item> {
  triggers: Dictionary<Trigger>;
  handlers: Dictionary<TriggerHandler>;
}

export const INITIAL_STREAM_STATE: FlogoStreamState = {
  id: null,
  name: null,
  description: null,
  app: null,
  mainItems: null,
  mainGraph: null,
  triggers: null,
  handlers: null,
  schemas: null,
};
