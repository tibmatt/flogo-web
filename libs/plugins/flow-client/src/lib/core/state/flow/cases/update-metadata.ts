import { FlowMetadata, MetadataAttribute } from '@flogo-web/client-core';
import { FlowState } from '../flow.state';

export function updateMetadata(state: FlowState, newMetadata: FlowMetadata): FlowState {
  return {
    ...state,
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
