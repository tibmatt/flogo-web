import { select, Store } from '@ngrx/store';
import {filter, switchMap, take} from 'rxjs/operators';
import { FlowSelectors, FlowState } from '@flogo/flow/core/state';
import { AppState } from '@flogo/flow/core/state/app.state';
import { Observable, of as observableOf } from 'rxjs';
import {FLOGO_TASK_TYPE} from '@flogo/core';

const getFlowState = (store: Store<AppState>, taskId: string, taskType: FLOGO_TASK_TYPE[]): Observable<FlowState> => {
  return store.pipe(
    select(FlowSelectors.selectFlowState),
    take(1),
    filter((state) => taskType.includes((state.mainItems[taskId] || state.errorItems[taskId]).type))
  );
};

export function getStateWhenConfigureChanges(taskType: FLOGO_TASK_TYPE[]) {
  return (store: Store<AppState>) => store.pipe(
    select(FlowSelectors.selectTaskConfigure),
    switchMap((taskId) => taskId ? getFlowState(store, taskId, taskType) : observableOf(null))
  );
}
