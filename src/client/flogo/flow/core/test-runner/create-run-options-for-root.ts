import { chain, cloneDeep, get, isEmpty, isNil } from 'lodash';
import { MetadataAttribute } from '@flogo/core';
import { FlowState } from '@flogo/flow/core/state';
import { RunOptions } from './run-orchestrator.service';

export function createRunOptionsForRoot(flowState: FlowState) {
  const initData = getInitDataForRoot(flowState);
  const runOptions: RunOptions = { attrsData: initData };
  const shouldUpdateFlow = flowState.configChangedSinceLastExecution || !flowState.lastFullExecution.processId;
  if (shouldUpdateFlow) {
    runOptions.useFlowId = flowState.id;
  } else {
    runOptions.useProcessId = flowState.lastFullExecution.processId;
  }
  return runOptions;
}

function getInitDataForRoot(flowState: FlowState): undefined | ((MetadataAttribute & { value: any })[]) {
  const flowInput = get(flowState, 'metadata.input') as MetadataAttribute[];
  if (isEmpty(flowInput)) {
    return undefined;
  }
  return chain(flowInput)
    .filter((item: any) => {
      // filter empty values
      return !isNil(item.value);
    })
    .map((item: any) => cloneDeep(item))
    .value();
}
