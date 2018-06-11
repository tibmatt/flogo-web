import { mapValues, isObject, isUndefined, keyBy, isEmpty } from 'lodash';
import { createFormGroupState, disable, formGroupReducer, FormGroupState, isNgrxFormsAction, updateGroup } from 'ngrx-forms';
import {Action} from '@ngrx/store';
import {
  Dictionary, FLOGO_PROFILE_TYPE,
  flow,
  MetadataAttribute,
  SchemaAttribute as ContribSchemaAttribute,
  TriggerSchema
} from '../../../../core/index';
import {
  Trigger,
  TriggerConfigureSettings,
  TriggerHandler,
  TriggerConfigureState,
  TriggerConfigureGroups, TriggerConfigureTabType,
} from '../../interfaces/index';
import { TriggerConfigureGroup, TriggerConfigureMappings } from '../../interfaces/trigger-configure';
import {FlowState} from '../flow/flow.state';
import {TriggerConfigureActionType, TriggerConfigureActionUnion} from './trigger-configure.actions';
import Mapping = flow.Mapping;
import {getProfileType} from '../../../../shared/utils';

const SETTINGS_TAB: { type: TriggerConfigureTabType, i18nKey: string } = {
  'type': 'settings',
  'i18nKey': 'TRIGGER-CONFIGURATOR:SETTINGS'
};

const INPUT_MAPPINGS_TAB: { type: TriggerConfigureTabType, i18nKey: string } = {
  'type': 'flowInputMappings',
  'i18nKey': 'TRIGGER-CONFIGURATOR:FLOW-INPUTS'
};

const OUTPUT_MAPPINGS_TAB: { type: TriggerConfigureTabType, i18nKey: string } = {
  'type': 'flowOutputMappings',
  'i18nKey': 'TRIGGER-CONFIGURATOR:FLOW-OUTPUTS'
};

export function triggerConfigureReducer(state: FlowState, action: TriggerConfigureActionUnion) {
  switch (action.type) {
    case TriggerConfigureActionType.OpenConfigureWithSelection:
      const selectedTriggerId = action.payload.triggerId;
      const {triggers, tabs,  fields} = initTriggerConfigureState(state, action.payload.triggerSchemas);
      return {
        ...state,
        triggerConfigure: {
          isOpen: true,
          selectedTriggerId,
          currentTab: <TriggerConfigureTabType> 'settings',
          schemas: action.payload.triggerSchemas,
          // triggersForm: initTriggerConfigureGroups(createTriggersFormGroup(state, action.payload.triggerSchemas)),
          triggers,
          tabs,
          fields
        }
      };
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

function createTriggerState(trigger, profileType) {
  let allowedTabs = [SETTINGS_TAB];
  if (profileType === FLOGO_PROFILE_TYPE.MICRO_SERVICE) {
    allowedTabs = [...allowedTabs, INPUT_MAPPINGS_TAB, OUTPUT_MAPPINGS_TAB];
  }
  return {
    name: trigger.name,
    tabs: allowedTabs.map(t => [trigger.id, t.type].join('.')),
    isValid: true,
    isDirty: false
  };
}

function createTriggerConfigureTabs(tabs) {
  return tabs.reduce((tabsDictionary, tabName) => {
    const [triggerId, type] = tabName.split('.');
    tabsDictionary[tabName] = {
      triggerId,
      type,
      i18nKey: '',
      isValid: true,
      isDirty: false,
      isEnabled: true
    };
    return tabsDictionary;
  }, {});
}

function initTriggerConfigureState(state: FlowState, triggersSchema: Dictionary<TriggerSchema>) {
  const triggerConfigureState = Object.values(state.triggers).reduce(({triggers, tabs, fields}, trigger) => {
    triggers[trigger.id] = createTriggerState(trigger, getProfileType(state.app));
    tabs = {...tabs, ...createTriggerConfigureTabs(triggers[trigger.id].tabs)};
    return {triggers, tabs, fields};
  }, {triggers: {}, tabs: {}, fields: {}});
  debugger;
  return {
    ...triggerConfigureState
  };
}
