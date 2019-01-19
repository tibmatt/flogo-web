import { Resource } from './resource';

export interface ApiResource<T = unknown> extends Resource<T> {
  appId?: string;
  // TODO: type of server app
  app?: any;
}
