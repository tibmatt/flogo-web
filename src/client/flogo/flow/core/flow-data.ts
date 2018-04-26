import { HandlerInfo, UiFlow } from '@flogo/core';

export interface FlowData {
  flow: UiFlow;
  triggers: any;
  root: HandlerInfo;
  errorHandler: HandlerInfo;
}
