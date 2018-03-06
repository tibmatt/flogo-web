import {FlowMetadata} from '@flogo/core';
export interface SubFlowConfig {
  name: string;
  description: string;
  createdAt: string;
  flowPath: string;
  metadata?: FlowMetadata;
}
