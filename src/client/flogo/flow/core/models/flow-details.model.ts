import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { FLOGO_PROFILE_TYPE } from '@flogo/core/constants';
import { ActionBase, UiFlow, ItemTask, GraphNode } from '@flogo/core';
import { getProfileType } from '@flogo/shared/utils';
import * as selectionFactory from './flow/selection-factory';
import { FlowState } from './flow-state';
import { addNewNode } from '@flogo/flow/core/models/flow/add-new-node';
import { removeNode } from '@flogo/flow/core/models/flow/remove-node';

export enum HandlerType {
  Main = 'main',
  Error = 'error',
}

const getGraphName = (handlerType: HandlerType) => `${handlerType}Graph`;
const getItemsDictionaryName = (handlerType: HandlerType) => `${handlerType}Items`;

export class FlogoFlowDetails {
  id: string;
  associatedToAppId: string;
  applicationProfileType: FLOGO_PROFILE_TYPE;
  relatedSubFlows: Map<string, ActionBase>;
  flow: UiFlow;

  flow$: BehaviorSubject<FlowState>;

  constructor(flow, subFlowRelations: ActionBase[], uiFlow: UiFlow) {
    this.id = flow.id;
    this.associatedToAppId = flow.app.id;
    this.applicationProfileType = getProfileType(flow.app);
    this.relatedSubFlows = new Map(<[string, ActionBase][]> subFlowRelations.map(a => [a.id, a]));
    this.flow$ = new BehaviorSubject<FlowState>({
      ...uiFlow,
      currentSelection: null,
    });
  }

  selectItem(itemId: string) {
    const currentState = this.currentState;
    this.flow$.next({
      ...currentState,
      currentSelection: selectionFactory.makeTaskSelection(itemId),
    });
  }

  selectInsert(parentItemId: string) {
    this.commitStateUpdate({
      currentSelection: selectionFactory.makeInsertSelection(parentItemId),
    });
  }

  registerNewItem(handlerType: HandlerType, { item, node }: { item: ItemTask, node: GraphNode }) {
    const state = this.currentState;
    const graphName = getGraphName(handlerType);
    const itemsDictionaryName = getItemsDictionaryName(handlerType);
    const itemsDictionary = state[itemsDictionaryName];
    this.commitStateUpdate({
      currentSelection: selectionFactory.makeTaskSelection(node.id),
      [graphName]: addNewNode(state[graphName], node),
      [itemsDictionaryName]: {
        ...itemsDictionary,
        [item.id]: { ...item }
      }
    });
  }

  removeItem(handlerType: HandlerType, itemId: string): FlowState {
    const state = this.currentState;
    const graphName = getGraphName(handlerType);
    const itemDictionaryName = getItemsDictionaryName(handlerType);
    const graph = removeNode(state[graphName], itemId);
    if (graph === state[graphName]) {
      return state;
    }
    let currentSelection = state.currentSelection;
    if (currentSelection && !state.mainGraph[currentSelection.taskId] && !state.errorGraph[currentSelection.taskId]) {
      currentSelection = null;
    }
    const { [itemId]: removedItem, ...itemsDictionary } = state[itemDictionaryName];
    this.commitStateUpdate({
      [graphName]: graph,
      [itemDictionaryName]: itemsDictionary,
      currentSelection
    });
  }

  updateTask(handlerType: HandlerType, { item }: { item: Partial<ItemTask> }) {
    const state = this.currentState;
    const itemsDictionaryName = getItemsDictionaryName(handlerType);
    const dictionary = state[itemsDictionaryName];
    this.commitStateUpdate({
      [itemsDictionaryName]: {
        ...dictionary,
        [item.id]: {...dictionary[item.id], ...item}
      },
    });
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

  destroy() {
    if (this.flow$ && !this.flow$.closed) {
      this.flow$.complete();
    }
  }

  private commitStateUpdate(nextStateDiff: Partial<FlowState>) {
    const currentState = this.currentState;
    this.flow$.next({
      ...currentState,
      ...nextStateDiff,
    });
  }

  private get currentState() {
    return this.flow$.getValue();
  }

}


