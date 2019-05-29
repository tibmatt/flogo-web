import { FlowState } from '../flow.state';
import { MetadataAttribute } from '@flogo-web/core';
import { StreamParams } from '../../../interfaces/flow';

export function updateMetadata(state: FlowState, streamParams: StreamParams): FlowState {
  const newMetadata = streamParams.metadata;
  return {
    ...state,
    groupBy: streamParams.groupBy,
    metadata: {
      input: mergeFlowInputMetadata(state.metadata.input, newMetadata.input),
      output: newMetadata.output,
    },
  };
}

function mergeFlowInputMetadata(
  existingInputMetadata: MetadataAttribute[],
  newInputMetadata: MetadataAttribute[]
): MetadataAttribute[] {
  const existingInputs = new Map(
    existingInputMetadata.map(i => [i.name, i] as [string, MetadataAttribute])
  );
  return newInputMetadata.map(input => {
    const existingInput = existingInputs.get(input.name);
    if (existingInput && existingInput.type === input.type) {
      input = { ...input, value: existingInput.value };
    }
    return input;
  });
}
