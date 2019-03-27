import { FlowMetadata } from '../core/interfaces/flow';

export interface SubFlowConfig {
  name: string;
  description: string;
  createdAt: string;
  flowPath: string;
  metadata?: FlowMetadata;
}
