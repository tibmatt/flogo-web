import { TriggerConfigureTabType } from '../../interfaces';
import {FlowState} from '../flow/flow.state';
import {TriggerConfigureActionType, TriggerConfigureActionUnion} from './trigger-configure.actions';
import { init } from './cases/init';
import { mapperStatusReducer } from './cases/mapper-status-reducer';

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
          currentTab: TriggerConfigureTabType.Settings,
        }
      };
    case TriggerConfigureActionType.SelectTab:
      return {
        ...state,
        triggerConfigure: {
          ...state.triggerConfigure,
          currentTab: action.payload,
        }
      };
    case TriggerConfigureActionType.MapperStatusChanged: {
      const { triggerId, groupType, newStatus } = action.payload;
      const groupId = `${triggerId}.${groupType}`;
      return {
        ...state,
        triggerConfigure: mapperStatusReducer(state.triggerConfigure, groupId, newStatus),
      };
    }
    default: {
      return state;
    }
  }
}
