import { isEqual } from 'lodash';
import { Store } from '@ngrx/store';
import { distinctUntilChanged } from 'rxjs/operators';

import { Action as ActionSchema, ContribSchema, Dictionary, GraphNode, Item, ItemTask, StepAttribute, UiFlow } from '@flogo/core';

import { FLOGO_PROFILE_TYPE } from '@flogo/core/constants';
import { getProfileType } from '@flogo/shared/utils';

import { FlowActions, FlowSelectors } from '../state';
import { AppState } from '../state/app.state';
import { HandlerType } from './handler-type';

export class FlogoFlowDetails {
  id: string;
  associatedToAppId: string;
  applicationProfileType: FLOGO_PROFILE_TYPE;
  flow: UiFlow;

  constructor(flow, private store: Store<AppState>) {
    this.id = flow.id;
    this.associatedToAppId = flow.app.id;
    this.applicationProfileType = getProfileType(flow.app);
  }

  get runnableState$() {
    return this.store.select(FlowSelectors.getRunnableState);
  }

  get itemsChange$() {
    return this.store.select(FlowSelectors.getAllItems);
  }

  get flowState$() {
    return this.store.select(FlowSelectors.selectFlowState);
  }

  get selectionChange$() {
    return this.store
      .select(FlowSelectors.selectCurrentSelection)
      .pipe(distinctUntilChanged(isEqual));
  }

  registerNewItem(
    handlerType: HandlerType,
    itemDetails: { item: ItemTask, node: GraphNode, schema: ContribSchema, subflowSchema?: ActionSchema }
   ) {
    this.store.dispatch(new FlowActions.TaskItemCreated({ handlerType, ...itemDetails }));
  }

  removeItem(handlerType: HandlerType, itemId: string) {
    this.store.dispatch(new FlowActions.RemoveItem({
      handlerType,
      itemId,
    }));
  }

  updateItem(handlerType: HandlerType, { item, node }: { item: {id: string} & Partial<Item>, node?: {id: string} & Partial<GraphNode> }) {
    this.store.dispatch(new FlowActions.ItemUpdated({
      handlerType,
      item,
      node,
    }));
  }

  runFromStart() {
    this.store.dispatch(new FlowActions.RunFromStart());
  }

  runFromTask() {
    this.store.dispatch(new FlowActions.RunFromTask());
  }

  executionStatusChanged(changes: { mainGraphNodes?: Dictionary<GraphNode>, errorGraphNodes?: Dictionary<GraphNode> }) {
    this.store.dispatch(new FlowActions.ExecutionStateUpdated({ changes }));
  }

  executionStepsUpdate(steps: Dictionary<Dictionary<StepAttribute>>) {
    this.store.dispatch(new FlowActions.ExecutionStepsUpdated({ steps }));
  }

  newExecutionStarted() {
    this.store.dispatch(new FlowActions.NewExecutionRegistered());
  }

  executionProcessChanged(processId: string, instanceId: string) {
    this.store.dispatch(new FlowActions.NewRunFromStartProcess({ processId, instanceId }));
  }

}
