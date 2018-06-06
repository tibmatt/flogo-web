import { mapValues, isObject, isUndefined } from 'lodash';
import { Action } from '@ngrx/store';
import { FlowState } from '@flogo/flow/core/state/flow.state';
import { isNgrxFormsAction, createFormGroupState, formGroupReducer, FormGroupState, updateGroup } from 'ngrx-forms';
import { TriggerActionsUnion, TriggerActionType } from './triggers.actions';
import { Dictionary, SchemaAttribute, TriggerSchema } from '@flogo/core';
import { makeTriggerSelection, isTriggerSelection } from '@flogo/flow/core/models/flow/selection';
import { Trigger, TriggerHandler, TriggerConfigureSettings } from '@flogo/flow/core/interfaces';
import { AbstractControlState } from 'ngrx-forms/src/state';
import { TriggerConfigureState } from '@flogo/flow/core/interfaces/trigger-configure';

export function triggersReducer(state: FlowState, action: TriggerActionsUnion): FlowState {
  state = reduceTriggerConfigure(state, action);
  switch (action.type) {
    case TriggerActionType.SelectTrigger: {
      return {
        ...state,
        // todo: remove once selection display is not needed
        currentSelection: makeTriggerSelection(action.payload.triggerId),
        triggerConfigure: {
          selectedTriggerId: action.payload.triggerId,
          schemas: action.payload.triggerSchemas,
          triggersForm: createTriggersFormGroup(state.handlers, state.triggers, action.payload.triggerSchemas),
        },
      };
    }
    case TriggerActionType.UpdateHandler: {
      const payload = action.payload;
      return {
        ...state,
        handlers: {
          ...state.handlers,
          [payload.triggerId]: payload.handler,
        },
      };
    }
    case TriggerActionType.UpdateTrigger: {
      return {
        ...state,
        triggers: {
          ...state.triggers,
          [action.payload.id]: { ...action.payload },
        }
      };
    }
    case TriggerActionType.AddTrigger: {
     const { trigger, handler } = action.payload;
     const handlers = state.handlers;
     const triggerId = trigger.id;
     return {
       ...state,
       triggers: {
         ...state.triggers,
         [triggerId]: { ...trigger },
       },
       handlers: {
         ...handlers,
         [triggerId]: {
           ...handler, triggerId
         },
       },
     };
    }
    case TriggerActionType.RemoveHandler: {
      state = removeTriggerAndHandler(state, action.payload);
      const currentSelection = state.currentSelection;
      if (isTriggerSelection(currentSelection) && currentSelection.triggerId === action.payload) {
        return {
          ...state,
          currentSelection: null,
        };
      }
      return state;
    }
    case TriggerActionType.CopyTrigger: {
      const payload = action.payload;
      state = removeTriggerAndHandler(state, payload.copiedTriggerId);
      let currentSelection = state.currentSelection;
      const newTrigger = payload.newTrigger;
      if (isTriggerSelection(currentSelection) && currentSelection.triggerId === payload.copiedTriggerId) {
        currentSelection = makeTriggerSelection(newTrigger.id);
      }
      return {
        ...state,
        currentSelection,
        triggers: {
          ...state.triggers,
          [newTrigger.id]: newTrigger,
        },
        handlers: {
          ...state.handlers,
          [newTrigger.id]: payload.newHandler,
        },
      };
    }
    default: {
      return state;
    }
  }
}

function removeTriggerAndHandler(state: FlowState, triggerId: string) {
  const { [triggerId]: handlerToRemove, ...handlers } = state.handlers;
  const { [triggerId]: triggerToRemove, ...triggers } = state.triggers;
  return {
    ...state,
    triggers,
    handlers,
  };
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
    return [schemaAttribute.name, isPrimitive(value) ? value : JSON.stringify(value)];
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
