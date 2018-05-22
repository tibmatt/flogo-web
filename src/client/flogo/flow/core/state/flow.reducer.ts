import * as selectionFactory from '../models/flow/selection-factory';
import { cleanGraphRunState } from '../models/flow/clean-run-state';

import * as actions from './flow.actions';
import { FlowState, INITIAL_STATE } from './flow.state';

import { createBranch } from './cases/create-branch';
import { taskItemCreated } from './cases/task-item-created';
import { removeItem } from './cases/remove-item';
import { itemUpdate } from './cases/item-update';
import { executionUpdate } from './cases/execution-update';

const ActionType = actions.ActionType;

export function flowReducer(state: FlowState = INITIAL_STATE, action: actions.ActionsUnion): FlowState {
  switch (action.type) {
    case ActionType.Init: {
      return {
        ...INITIAL_STATE,
        ...action.payload,
      };
    }
    case ActionType.SelectItem: {
      return {
        ...state,
        currentSelection: selectionFactory.makeTaskSelection(action.payload.itemId),
      };
    }
    case ActionType.SelectCreateItem: {
      return {
        ...state,
        currentSelection: selectionFactory.makeInsertSelection(action.payload.handlerType, action.payload.parentItemId),
      };
    }
    case ActionType.ClearSelection: {
      return {
        ...state,
        currentSelection: null,
      };
    }
    case ActionType.CreateBranch: {
      return createBranch(state, action.payload);
    }
    case ActionType.TaskItemCreated: {
      return taskItemCreated(state, action.payload);
    }
    case ActionType.RemoveItem: {
      return removeItem(state, action.payload);
    }
    case ActionType.ItemUpdated: {
      return itemUpdate(state, action.payload);
    }
    case ActionType.ConfigureItem: {
      // todo: currently managed directly by flow.component
      return state;
    }
    case ActionType.ExecutionWillStart: {
      return  {
        ...state,
        isErrorPanelOpen: false,
        mainGraph: cleanGraphRunState(state.mainGraph),
        errorGraph: cleanGraphRunState(state.errorGraph),
      };
    }
    case ActionType.ExecutionUpdated: {
      return executionUpdate(state, action.payload);
    }
    case ActionType.ErrorPanelStatusChange: {
      return {
        ...state,
        isErrorPanelOpen: action.payload.isOpen
      };
    }
  }
  return state;
}

