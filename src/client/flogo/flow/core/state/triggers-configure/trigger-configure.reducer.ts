import { TriggerConfigureTabType } from '../../interfaces';
import {FlowState} from '../flow/flow.state';
import {TriggerConfigureActionType, TriggerConfigureActionUnion} from './trigger-configure.actions';
import { init } from '@flogo/flow/core/state/triggers-configure/cases/init';

export function triggerConfigureReducer(state: FlowState, action: TriggerConfigureActionUnion) {
  switch (action.type) {
    case TriggerConfigureActionType.OpenConfigureWithSelection: {
      return init(state, action.payload);
    }
    case TriggerConfigureActionType.CloseConfigure:
      return {
        ...state,
        triggerConfigure: null
      };
    case TriggerConfigureActionType.SelectTrigger:
      return {
        ...state,
        triggerConfigure: {
          ...state.triggerConfigure,
          selectedTriggerId: action.payload,
          currentTab: 'settings' as TriggerConfigureTabType,
        }
      };
    case TriggerConfigureActionType.SelectTab:
      return {
        ...state,
        triggerConfigure: {
          ...state.triggerConfigure,
          currentTab: action.payload as TriggerConfigureTabType,
        }
      };
    default: {
      return state;
    }
  }
}
