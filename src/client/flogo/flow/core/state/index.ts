import { Action, ActionReducer } from '@ngrx/store';
import { INITIAL_STATE, FlowState } from './flow.state';
import { flowReducer } from './flow.reducer';
import { triggersReducer } from './triggers.reducer';
import { triggerConfigureReducer } from './trigger-configure.reducer';

const reducers: ActionReducer<FlowState, Action>[] = [flowReducer, triggersReducer, triggerConfigureReducer];
export function featureReducer(state = INITIAL_STATE, action: Action) {
  return reducers.reduce((nextState, reducer) => reducer(nextState, action), state);
}

export * from './flow.actions';
export * from './flow.state';
export * from './flow.reducer';
export * from './flow.selectors';

import * as FlowActions from './flow.actions';
export { FlowActions };

import * as FlowSelectors from './flow.selectors';
export { FlowSelectors };
