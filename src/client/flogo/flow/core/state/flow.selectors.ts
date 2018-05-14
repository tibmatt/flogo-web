import { createSelector, createFeatureSelector } from '@ngrx/store';
import { FlowState } from './flow.state';

export const selectFlowState = createFeatureSelector<FlowState>('flow');
export const selectCurrentSelection = createSelector(selectFlowState, (flowState: FlowState) => flowState.currentSelection);
