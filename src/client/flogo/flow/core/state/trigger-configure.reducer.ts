import {FlowState} from './flow.state';
import {TriggerConfigureActionType, TriggerConfigureActionUnion} from './trigger-configure.actions';
import {createFormGroupState, formGroupReducer, FormGroupState, isNgrxFormsAction} from 'ngrx-forms';
import {Trigger, TriggerConfigureSettings, TriggerHandler, TriggerConfigureState} from '../interfaces';
import {Dictionary, SchemaAttribute, TriggerSchema} from '@flogo/core';
import {Action} from '@ngrx/store';
import {mapValues, isObject, isUndefined} from 'lodash';

export function triggerConfigureReducer(state: FlowState, action: TriggerConfigureActionUnion) {
  state = reduceTriggerConfigure(state, action);
  switch (action.type) {
    case TriggerConfigureActionType.OpenConfigureWithSelection:
      return {
        ...state,
        triggerConfigure: {
          isOpen: true,
          selectedTriggerId: action.payload.triggerId,
          schemas: action.payload.triggerSchemas,
          triggersForm: createTriggersFormGroup(state.handlers, state.triggers, action.payload.triggerSchemas),
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
          selectedTriggerId: action.payload
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

type TriggerFormsState = FormGroupState<Dictionary<TriggerConfigureSettings>>;
function createTriggersFormReducer(triggers: FlowState['triggers'], schemas: TriggerConfigureState['schemas']):
  (state: TriggerFormsState, action: Action) => TriggerFormsState {
  // use triggers + schemas to generate form updater
  // schemaFormUpdateFns: Dictionary<string, formGroupUpdate> = schemas.map(schema => createUpdateGroupFromSchema(schema))
  // triggerUpdateFns = triggers.map(trigger => {
  //     return [trigger.id, (state) => schemaFormUpdateFns[trigger.ref](state) ]
  //  })
  // return createFormGroupReducerWithUpdate(fromPairs(triggerUpdateFns))
  return formGroupReducer;
}

const isPrimitive = value => !isObject(value);

function settingsToFormProperties(schemaAttributes: SchemaAttribute[] = [], instanceProperties: Dictionary<any> = {}) {
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

function mergeTriggerWithSchema(handler: TriggerHandler, trigger: Trigger, schema: TriggerSchema): TriggerConfigureSettings {
  const handlerSchema = trigger.handler || {} as TriggerSchema['handler'];
  return {
    id: trigger.id,
    name: trigger.name,
    description: trigger.description,
    trigger: settingsToFormProperties(schema.settings, trigger.settings),
    handler: settingsToFormProperties(handlerSchema.settings as SchemaAttribute[], handler.settings)
  };
}

function createTriggersFormGroup(handlers: Dictionary<TriggerHandler>, triggers: Dictionary<Trigger>, schemas: Dictionary<TriggerSchema>):
  FormGroupState<Dictionary<TriggerConfigureSettings>> {
  return createFormGroupState('triggerConfig', mapValues(handlers, (handler, triggerId) => {
    const trigger = triggers[triggerId];
    return mergeTriggerWithSchema(handler, trigger, schemas[trigger.ref]);
  }));
}
