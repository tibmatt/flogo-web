import { FlowSummary } from '@flogo/core';

export interface DeleteEvent {
  triggerId: string;
  flow: FlowSummary;
}
