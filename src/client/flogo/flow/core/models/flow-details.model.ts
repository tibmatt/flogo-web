import { isEqual } from 'lodash';
import { Store } from '@ngrx/store';
import { distinctUntilChanged } from 'rxjs/operators';

import { ActionBase, ContribSchema, Dictionary, GraphNode, Item, ItemTask, UiFlow } from '@flogo/core';
import { FLOGO_PROFILE_TYPE } from '@flogo/core/constants';
import { getProfileType } from '@flogo/shared/utils';

import { FlowActions, FlowSelectors } from '../state';
import { AppState } from '../state/app.state';
import { HandlerType } from './handler-type';
import { newBranchId } from './flow/id-generator';

export class FlogoFlowDetails {
  id: string;
  associatedToAppId: string;
  applicationProfileType: FLOGO_PROFILE_TYPE;
  relatedSubFlows: Map<string, ActionBase>;
  flow: UiFlow;

  constructor(flow, subFlowRelations: Map<string, ActionBase>, private store: Store<AppState>) {
    this.id = flow.id;
    this.associatedToAppId = flow.app.id;
    this.applicationProfileType = getProfileType(flow.app);
    this.relatedSubFlows = subFlowRelations;
  }

  get flowState$() {
    return this.store.select(FlowSelectors.selectFlowState);
  }

  get selectionChange$() {
    return this.store
      .select(FlowSelectors.selectCurrentSelection)
      .pipe(distinctUntilChanged(isEqual));
  }

  selectItem(itemId: string) {
    this.store.dispatch(new FlowActions.SelectItem({
      itemId,
    }));
  }

  selectInsert(handlerType: HandlerType, parentItemId: string) {
    this.store.dispatch(new FlowActions.SelectCreateItem({
      handlerType,
      parentItemId,
    }));
  }

  clearSelection() {
    this.store.dispatch(new FlowActions.ClearSelection());
  }

  createBranch(handlerType: HandlerType, parentId: string) {
    this.store.dispatch(new FlowActions.CreateBranch({
      handlerType,
      parentId,
      newBranchId: newBranchId(),
    }));
  }

  registerNewItem(handlerType: HandlerType, { item, node, schema }: { item: ItemTask, node: GraphNode, schema: ContribSchema }) {
    this.store.dispatch(
      new FlowActions.TaskItemCreated({
        handlerType,
        item,
        node,
        schema,
      })
    );
  }

  removeItem(handlerType: HandlerType, itemId: string) {
    this.store.dispatch(new FlowActions.RemoveItem({
      handlerType,
      itemId,
    }));
  }

  updateItem(handlerType: HandlerType, { item, node }: { item: {id: string} & Partial<Item>, node?: Partial<GraphNode> }) {
    this.store.dispatch(new FlowActions.ItemUpdated({
      handlerType,
      item,
      node,
    }));
  }

  clearExecutionStatus() {
    this.store.dispatch(new FlowActions.ExecutionWillStart());
  }

  executionStatusChanged(changes: { mainGraphNodes?: Dictionary<GraphNode>, errorGraphNodes?: Dictionary<GraphNode> }) {
    this.store.dispatch(new FlowActions.ExecutionStateUpdated({ changes }));
  }

  addSubflowSchema(flow: ActionBase) {
    this.relatedSubFlows.set(flow.id, flow);
  }

  getSubflowSchema(flowId: string): ActionBase {
    return this.relatedSubFlows.get(flowId);
  }

  deleteSubflowSchema(flowId: string) {
    this.relatedSubFlows.delete(flowId);
  }

}


