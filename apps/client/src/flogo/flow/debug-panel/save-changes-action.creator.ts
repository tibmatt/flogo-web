import { select, Store } from '@ngrx/store';
import { isEqual } from 'lodash';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Dictionary, Item, ItemActivityTask } from '@flogo-web/client/core';
import { HandlerType } from '@flogo-web/client/flow/core/models';
import { FlowSelectors, FlowActions, FlowState } from '@flogo-web/client/flow/core/state';

export function createSaveChangesAction(store: Store<FlowState>, taskId, changes): Observable<null | FlowActions.ItemUpdated> {
  return store.pipe(
    select(FlowSelectors.selectFlowState),
    map(flowState => {
      const actionPayload = getChanges(flowState, taskId, changes);
      return actionPayload ? new FlowActions.ItemUpdated(actionPayload) : null;
    }),
  );
}

export function getChanges(flowState: FlowState, taskId, changedInputs) {
  let handlerType: HandlerType;
  let items: Dictionary<Item>;
  if (flowState.mainItems[taskId]) {
    handlerType = HandlerType.Main;
    items = flowState.mainItems;
  } else {
    handlerType = HandlerType.Error;
    items = flowState.errorItems;
  }
  const task = items[taskId] as ItemActivityTask;
  if (!task) {
    // update is not applicable anymore because task was deleted
    return null;
  }
  changedInputs = changedInputs || {};
  if (isEqual(changedInputs, task.input)) {
    return null;
  }
  const itemChanges: {id: string} & Partial<Item> = {
    id: task.id,
    input: { ...changedInputs  }
  };
  return {
    handlerType,
    item: itemChanges,
  };
}
