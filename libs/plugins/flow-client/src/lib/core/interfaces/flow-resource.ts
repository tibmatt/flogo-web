import { ApiResource } from '@flogo-web/core';
import { flow } from '@flogo-web/client-core';

export interface ResourceFlowData {
  appId?: string;
  triggers?: any[];
  updatedAt: string;
  tasks: flow.Task[];
  links: flow.Link[];
  errorHandler?: {
    tasks: flow.Task[];
    links: flow.Link[];
  };
  explicitReply?: boolean;
}

export type FlowResource = ApiResource<ResourceFlowData>;
