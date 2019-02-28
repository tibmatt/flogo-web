import { Resource } from '@flogo-web/core';
import { FlowData } from './flow';

export function isFlowResource(r: Partial<Resource>): r is Resource<FlowData> {
  return r && r.type === 'flow';
}
