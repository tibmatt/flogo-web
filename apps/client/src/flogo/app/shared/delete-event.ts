import { FlowSummary } from '@flogo-web/client/core';

export interface DeleteEvent {
  triggerId: string;
  flow: FlowSummary;
}
