import { FlowMetadata } from '@flogo-web/client-core';
export interface SubFlowConfig {
  name: string;
  description: string;
  createdAt: string;
  flowPath: string;
  metadata?: FlowMetadata;
}
