import { ResourceHooks, ValidationError } from '@flogo-web/server/core';
import { FlowData } from '@flogo-web/core';
import { validateFlowData } from './validation';
import { isFlowResource } from './is-flow-resource';

export const resourceHooks: ResourceHooks<FlowData> = {
  before: {
    async create(context) {
      if (isFlowResource(context.resource)) {
        runValidation(context.resource.data);
      }
      return context;
    },
    async update(context) {
      if (isFlowResource(context.resource)) {
        runValidation(context.resource.data);
      }
      return context;
    },
  },
};

function runValidation(data: FlowData) {
  const errors = validateFlowData(data);
  if (errors) {
    throw new ValidationError('Flow data validation errors', errors);
  }
}
