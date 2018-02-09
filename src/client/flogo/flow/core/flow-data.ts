import { HandlerInfo } from '@flogo/core';

export interface FlowData {
  flow: any;
  triggers: any;
  root: HandlerInfo;
  errorHandler: HandlerInfo;
}
