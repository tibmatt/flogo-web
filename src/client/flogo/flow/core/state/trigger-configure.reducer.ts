import { mapValues, isObject, isUndefined, keyBy, isEmpty } from 'lodash';
import { createFormGroupState, disable, formGroupReducer, FormGroupState, isNgrxFormsAction, updateGroup } from 'ngrx-forms';
import {Action} from '@ngrx/store';
import { Dictionary, flow, MetadataAttribute, SchemaAttribute as ContribSchemaAttribute, TriggerSchema } from '@flogo/core';
import {
  Trigger,
  TriggerConfigureSettings,
  TriggerHandler,
  TriggerConfigureState,
  TriggerConfigureGroups, TriggerConfigureTabType,
} from '../interfaces';
import { TriggerConfigureGroup, TriggerConfigureMappings } from '@flogo/flow/core/interfaces/trigger-configure';
import {FlowState} from './flow.state';
import {TriggerConfigureActionType, TriggerConfigureActionUnion} from './trigger-configure.actions';
import Mapping = flow.Mapping;

export function triggerConfigureReducer(state: FlowState, action: TriggerConfigureActionUnion) {
  state = reduceTriggerConfigure(state, action);
  switch (action.type) {
    case TriggerConfigureActionType.OpenConfigureWithSelection:
      const selectedTriggerId = action.payload.triggerId;
      return {
        ...state,
        triggerConfigure: {
          isOpen: true,
          selectedTriggerId,
          currentTab: <TriggerConfigureTabType> 'settings',
          schemas: action.payload.triggerSchemas,
          triggersForm: initTriggerConfigureGroups(createTriggersFormGroup(state, action.payload.triggerSchemas)),
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

function reduceTriggerConfigure(state: FlowState, action: Action) {
  if (!isNgrxFormsAction(action) || !state.triggerConfigure) {
    return state;
  }
  const formReducer = createTriggersFormReducer(state.triggers, state.triggerConfigure.schemas);
  const triggersForm = formReducer(state.triggerConfigure.triggersForm, action);
  if (triggersForm !== state.triggerConfigure.triggersForm) {
    state = {
      ...state,
      triggerConfigure: {
        ...state.triggerConfigure,
        triggersForm,
      }
    };
  }
  return state;
}

function createTriggersFormReducer(triggers: FlowState['triggers'], schemas: TriggerConfigureState['schemas']):
  (state: FormGroupState<TriggerConfigureGroups>, action: Action) => FormGroupState<TriggerConfigureGroups> {
  // const schemaFormUpdateFns = schemas.map(schema => createUpdateGroupFromSchema(schema));
  // triggerUpdateFns = triggers.map(trigger => {
  //     return [trigger.id, (state) => schemaFormUpdateFns[trigger.ref](state) ]
  //  })
  // return createFormGroupReducerWithUpdate(fromPairs(triggerUpdateFns))
  return formGroupReducer;
}

const isPrimitive = value => !isObject(value);
function settingsToFormProperties(schemaAttributes: ContribSchemaAttribute[] = [], instanceProperties: Dictionary<any> = {}) {
  return schemaAttributes.map(schemaAttribute => {
    const valueInProps = instanceProperties[schemaAttribute.name];
    const value = isUndefined(valueInProps) ? schemaAttribute.value : valueInProps;
    return [
      schemaAttribute.name,
      isPrimitive(value) ? value : JSON.stringify(value)
    ];
  }).reduce((props, [name, value]) => {
    props[name] = value;
    return props;
  }, {});
}

function mergeTriggerWithSchemaSettings(handler: TriggerHandler, trigger: Trigger, schema: TriggerSchema): TriggerConfigureSettings {
  const handlerSchema = trigger.handler || {} as TriggerSchema['handler'];
  return {
    id: trigger.id,
    groupId: 'settings',
    name: trigger.name,
    description: trigger.description,
    trigger: settingsToFormProperties(schema.settings, trigger.settings),
    handler: settingsToFormProperties(handlerSchema.settings as ContribSchemaAttribute[], handler.settings)
  };
}

function mergeFlowMetadataGroupWithActionMappings(
  flowInputs: MetadataAttribute[] = [],
  handlerInputMappings: Mapping[] = []
): TriggerConfigureMappings['mappings'] {
  const mappings = keyBy(handlerInputMappings, (mapping) => mapping.mapTo);
  const allFields = flowInputs
    .reduce((fields, flowInput) => {
      const mapping = mappings[flowInput.name];
      const hasMapping = mapping && !isUndefined(mapping.value);
      fields[flowInput.name] = hasMapping ? mapping.value : '';
      return fields;
    }, {});
  return isEmpty(allFields) ? null : allFields;
}

function createTriggersFormGroup(state: FlowState, schemas: Dictionary<TriggerSchema>):
  FormGroupState<TriggerConfigureGroups> {
  const handlers = state.handlers;
  const triggers = state.triggers;
  const metadata = state.metadata || {} as FlowState['metadata'];
  return createFormGroupState<TriggerConfigureGroups>('triggerConfig', mapValues(handlers, (handler, triggerId) => {
    const trigger = triggers[triggerId];
    const actionMappings = handler.actionMappings;
    return {
      id: triggerId,
      settings: mergeTriggerWithSchemaSettings(handler, trigger, schemas[trigger.ref]),
      inputMappings: {
        groupId: 'flowInputMappings' as 'flowInputMappings',
        mappings: mergeFlowMetadataGroupWithActionMappings(metadata.input, actionMappings.input),
      },
      outputMappings: {
        groupId: 'flowOutputMappings' as 'flowOutputMappings',
        mappings: mergeFlowMetadataGroupWithActionMappings(metadata.output, actionMappings.output),
      }
    };
  }));
}

function initTriggerConfigureGroups(triggerConfigureGroups: FormGroupState<TriggerConfigureGroups>) {
  const disableIfNothingToMap = (mappingsGroupState: FormGroupState<TriggerConfigureMappings>) => {
    return isEmpty(mappingsGroupState.value.mappings) ? disable(mappingsGroupState) : mappingsGroupState;
  };
  const initStateFn = updateGroup<TriggerConfigureGroup>({
    inputMappings: disableIfNothingToMap,
    outputMappings: disableIfNothingToMap,
  });
  return updateGroup(mapValues(triggerConfigureGroups.controls, () => initStateFn))(triggerConfigureGroups);
}
