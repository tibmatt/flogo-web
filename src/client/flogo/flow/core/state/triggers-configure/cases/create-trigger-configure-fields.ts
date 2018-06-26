import {isObject} from 'lodash';
import {Trigger, TriggerHandler} from '../../../interfaces/index';
import {isUndefined} from 'util';
import {Dictionary, TriggerSchema, SchemaAttribute} from '@flogo/core/index';
import {ConfigureTriggerDetails} from '../../../../triggers/configurator/interfaces';

export function createTriggerConfigureFields(triggerInstance: Trigger,
                                             handlerInstance: TriggerHandler,
                                             schema: TriggerSchema): ConfigureTriggerDetails['fields'] {
  const {name, description, settings: common} = triggerInstance;
  const {settings: handlerSettings} = handlerInstance;
  const {settings: triggerSettingsSchema, handler} = schema;
  const {settings: handlerSettingsSchema} = handler;
  return {
    settings: {
      name: createField(name),
      description: createField(description),
      triggerSettings: groupBySettings(triggerSettingsSchema || [], common),
      handlerSettings: groupBySettings(handlerSettingsSchema || [], handlerSettings)
    },
    flowInputMappings: null,
    flowOutputMappings: null
  };
}

function mergeSettingsWithSchema(schemaAttributes, instanceProperties) {
  return schemaAttributes.map(schemaAttribute => {
    const valueInProps = instanceProperties[schemaAttribute.name];
    const value = isUndefined(valueInProps) ? schemaAttribute.value : valueInProps;
    return [
      schemaAttribute.name,
      value
    ];
  }).reduce((props, [name, value]) => {
    props[name] = value;
    return props;
  }, {});
}

function groupBySettings(schema: SchemaAttribute[], instanceProperties: Dictionary<any>) {
  const mergedSettings = mergeSettingsWithSchema(schema, instanceProperties);
  return Object.keys(mergedSettings)
    .reduce((props, name) => {
      props[name] = createField(mergedSettings[name]);
      return props;
    }, {});
}

function createField(value) {
  return {
    isDirty: false,
    isValid: true,
    isEnabled: true,
    value: isObject(value) ? JSON.stringify(value) : value
  };
}
