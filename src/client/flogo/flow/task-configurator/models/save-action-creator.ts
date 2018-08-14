import { cloneDeep } from 'lodash';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { select, Store } from '@ngrx/store';

import {
  Action,
  ActionBase,
  FLOGO_TASK_TYPE,
  GraphNode,
  ItemActivityTask,
  ItemBranch,
  ItemSubflow,
  ItemTask
} from '@flogo/core';
import { isMapperActivity } from '@flogo/shared/utils';

import { FlowState, FlowSelectors, FlowActions } from '@flogo/flow/core/state';
import { HandlerType } from '@flogo/flow/core/models';
import { uniqueTaskName } from '@flogo/flow/core/models/unique-task-name';

export interface SaveTaskConfigEventData {
  tileId: string;
  iterator: {
    isIterable: boolean;
    iterableValue?: string;
  };
  inputMappings: any[];
  subflowPath?: string;
  changedSubflowSchema?: ActionBase;
}
export interface SaveBranchConfigEventData {
  id: string;
  condition: string;
}

export function createSaveAction(
  store: Store<FlowState>,
  saveData: SaveTaskConfigEventData
): Observable<FlowActions.CommitItemConfiguration> {
  return store.
    pipe(
      select(FlowSelectors.selectFlowState),
      take(1),
      map(flowState => new FlowActions.CommitItemConfiguration(getChanges(flowState, saveData))),
  );
}
export function createSaveBranchAction(
  store: Store<FlowState>,
  saveData: SaveBranchConfigEventData
): Observable<FlowActions.ItemUpdated> {
  return store.
  pipe(
    select(FlowSelectors.selectFlowState),
    take(1),
    map(flowState => new FlowActions.ItemUpdated(getBranchChanges(flowState, saveData))),
  );
}


function getChanges(flowState: FlowState, saveData: SaveTaskConfigEventData): FlowActions.CommitItemConfiguration['payload'] {
  let handlerType: HandlerType;
  let tile: ItemTask;
  const tileId = saveData.tileId;
  if (flowState.mainItems[tileId]) {
    handlerType = HandlerType.Main;
    tile = flowState.mainItems[tileId] as ItemTask;
  } else {
    handlerType = HandlerType.Error;
    tile = flowState.errorItems[tileId] as ItemTask;
  }
  const changedSubflowSchema = saveData.changedSubflowSchema;
  const tileAsSubflow = <ItemSubflow> tile;
  const itemChanges: {id: string} & Partial<ItemActivityTask & ItemSubflow> = {
    id: tile.id,
    settings: tile.settings,
  };
  if (changedSubflowSchema && tileAsSubflow.settings.flowPath !== saveData.subflowPath) {
    itemChanges.name = uniqueTaskName(changedSubflowSchema.name, flowState.mainItems, flowState.errorItems);
    itemChanges.description = changedSubflowSchema.description;
    itemChanges.settings = {
      ...itemChanges.settings,
      flowPath: changedSubflowSchema.id,
    };
  }
  const activitySchema = flowState.schemas[tile.ref];
  const isMapperTask = isMapperActivity(activitySchema);
  if (isMapperTask) {
    itemChanges.input = {
      mappings: cloneDeep(saveData.inputMappings),
    };
  } else {
    itemChanges.inputMappings = cloneDeep(saveData.inputMappings);
  }

  const iteratorInfo = saveData.iterator;
  itemChanges.settings = {
    ...itemChanges.settings,
    iterate: iteratorInfo.isIterable ? saveData.iterator.iterableValue : undefined,
  };
  return { handlerType, item: itemChanges, newSubflowSchema: changedSubflowSchema as Action };
}

function getBranchChanges(flowState: FlowState, saveData: SaveBranchConfigEventData): FlowActions.ItemUpdated['payload'] {
  let handlerType: HandlerType;
  const tileId = saveData.id;
  if (flowState.mainItems[tileId]) {
    handlerType = HandlerType.Main;
  } else {
    handlerType = HandlerType.Error;
  }

  const itemChanges: {id: string} & Partial<ItemBranch> = {
    id: saveData.id,
    condition: saveData.condition,
  };
  return { handlerType, item: itemChanges};
}
