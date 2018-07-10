import { select, Store } from '@ngrx/store';
import { switchMap, take } from 'rxjs/operators';
import { FlowSelectors, FlowState } from '@flogo/flow/core/state';
import { AppState } from '@flogo/flow/core/state/app.state';
import { Observable, of as observableOf } from 'rxjs';

const getFlowState = (store: Store<AppState>): Observable<FlowState> => {
  return store.pipe(
    select(FlowSelectors.selectFlowState),
    take(1),
  );
};

export function getStateWhenTaskConfigureChanges() {
  return (store: Store<AppState>) => store.pipe(
    select(FlowSelectors.selectTaskConfigure),
    switchMap((taskId) => taskId ? getFlowState(store) : observableOf(null))
  );
}
