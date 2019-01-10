import { isUndefined } from 'lodash';
import {
  ActivitySchema,
  FlowMetadata,
  MetadataAttribute,
  ValueType,
} from '@flogo-web/client-core';
import { AbstractModelConverter } from '../ui-converter.model';

export class MicroServiceModelConverter extends AbstractModelConverter {
  normalizeActivitySchema(schema: ActivitySchema) {
    return schema;
  }

  getFlowInformation(flowJSON) {
    const flowInputs = (flowJSON.metadata && flowJSON.metadata.input) || [];
    const flowOutputs = (flowJSON.metadata && flowJSON.metadata.output) || [];
    const metadata: FlowMetadata = {
      input: [],
      output: [],
    };

    metadata.input = flowInputs.map(input => {
      const inputMetadata: MetadataAttribute = {
        name: input.name,
        type: input.type || ValueType.String,
      };
      if (!isUndefined(input.value)) {
        inputMetadata.value = input.value;
      }
      return inputMetadata;
    });
    metadata.output = flowOutputs.map(input => ({
      name: input.name,
      type: input.type || ValueType.String,
    }));

    return {
      id: flowJSON.id,
      appId: flowJSON.app.id,
      name: flowJSON.name || flowJSON.id,
      description: flowJSON.description || '',
      app: flowJSON.app,
      metadata,
    };
  }
}
