import { isEqual } from 'lodash';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { FLOGO_PROFILE_TYPE } from '@flogo/core/constants';
import { ActionBase, UiFlow, ItemTask, GraphNode, Item, ContribSchema, NodeType } from '@flogo/core';
import { getProfileType } from '@flogo/shared/utils';
import * as selectionFactory from './flow/selection-factory';
import { FlowState } from './flow-state';
import { addNewNode } from './flow/add-new-node';
import { removeNode } from './flow/remove-node';
import { addNewBranch } from './flow/add-new-branch';
import { newBranchId } from '@flogo/flow/core/models/flow/id-generator';
import { ItemFactory } from '@flogo/flow/core/models/graph-and-items/item-factory';
import { Observable } from 'rxjs/Observable';
import { distinctUntilChanged, pluck } from 'rxjs/operators';
import { DiagramSelection } from '@flogo/packages/diagram';
import { DiagramSelectionType } from '@flogo/packages/diagram/interfaces';

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
  selectionChange$: Observable<DiagramSelection>;

  constructor(flow, subFlowRelations: Map<string, ActionBase>,) {
    this.id = flow.id;
    this.associatedToAppId = flow.app.id;
    this.applicationProfileType = getProfileType(flow.app);
    this.relatedSubFlows = subFlowRelations;
  }

  selectItem(itemId: string) {
    const currentState = this.currentState;
    this.flow$.next({
      ...currentState,
      currentSelection: selectionFactory.makeTaskSelection(itemId),
    });
  }

  selectInsert(diagramId: HandlerType, parentItemId: string) {
    this.commitStateUpdate({
      currentSelection: selectionFactory.makeInsertSelection(diagramId, parentItemId),
    });
  }

  createBranch(handlerType: HandlerType, parentId: string) {
    const state = this.currentState;
    const graphName = getGraphName(handlerType);
    const itemsDictionaryName = getItemsDictionaryName(handlerType);
    const itemBranch = ItemFactory.makeBranch({ taskID: newBranchId(), condition: 'true' });
    this.commitStateUpdate({
      currentSelection: {
        type: DiagramSelectionType.Insert,
        taskId: itemBranch.id,
      },
      [itemsDictionaryName]: {
        ...state[itemsDictionaryName],
        [itemBranch.id]: itemBranch,
      },
      [graphName]: addNewBranch(state[graphName], parentId, itemBranch.id),
    });
  }

  registerNewItem(handlerType: HandlerType, { item, node, schema }: { item: ItemTask, node: GraphNode, schema: ContribSchema }) {
    const state = this.currentState;
    const graphName = getGraphName(handlerType);
    const itemsDictionaryName = getItemsDictionaryName(handlerType);
    const itemsDictionary = state[itemsDictionaryName];
    const schemas = schema ? {...state.schemas, [schema.ref]: schema} : state.schemas;

    this.commitStateUpdate({
      currentSelection: selectionFactory.makeTaskSelection(node.id),
      [graphName]: addNewNode(state[graphName], node),
      [itemsDictionaryName]: {
        ...itemsDictionary,
        [item.id]: { ...item }
      },
      schemas,
    });
  }

  removeItem(handlerType: HandlerType, itemId: string): FlowState {
    const state = this.currentState;
    const graphName = getGraphName(handlerType);
    const itemDictionaryName = getItemsDictionaryName(handlerType);
    const result = removeNode({ flowGraph: state[graphName], items: state[itemDictionaryName] }, itemId);
    if (result.flowGraph === state[graphName]) {
      return state;
    }
    let currentSelection = state.currentSelection;
    if (currentSelection && !state.mainGraph[currentSelection.taskId] && !state.errorGraph[currentSelection.taskId]) {
      currentSelection = null;
    }
    this.commitStateUpdate({
      [graphName]: result.flowGraph,
      [itemDictionaryName]: result.items,
      currentSelection
    });
  }

  updateItem(handlerType: HandlerType, { item }: { item: Partial<Item> }) {
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

  initState(uiFlow: UiFlow) {
    this.flow$ = new BehaviorSubject<FlowState>({
      ...uiFlow,
      currentSelection: null,
    });
    this.selectionChange$ = this.flow$.pipe(
      pluck<FlowState, DiagramSelection>('currentSelection'),
      distinctUntilChanged(isEqual),
    );
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


