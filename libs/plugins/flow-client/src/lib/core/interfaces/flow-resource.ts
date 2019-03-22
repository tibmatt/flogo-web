import { ApiResource, Resource } from '@flogo-web/core';
import { flow } from '@flogo-web/client/core';

export interface ResourceFlowData {
  tasks: flow.Task[];
  links: flow.Link[];
  errorHandler?: {
    tasks: flow.Task[];
    links: flow.Link[];
  };
  explicitReply?: boolean;
}

export type FlowResource = Resource<ResourceFlowData>;
export type ApiFlowResource = ApiResource<ResourceFlowData>;
