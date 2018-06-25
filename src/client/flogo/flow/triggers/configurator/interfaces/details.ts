import {
  TriggerConfigureTab,
  TriggerConfigureField,
  TriggerConfigureFields,
  TriggerConfigureTabType
} from '@flogo/flow/core';
import {Dictionary, SchemaAttribute, TriggerSchema} from '@flogo/core';
import {ValidatorFn} from '@angular/forms';

export interface ConfigureTriggerDetails {
  tabs: TriggerConfigureTab[];
  fields: {
    [tabName in TriggerConfigureTabType]: {
      [fieldName: string]: TriggerConfigureFields | TriggerConfigureField
    };
  };
  schema: TriggerSchema;
}

export type SettingControlGroupType = 'triggerSettings' | 'handlerSettings';
export enum SettingControlGroup {
  TRIGGER = 'triggerSettings',
  HANDLER = 'handlerSettings'
}
export interface SettingControlInfo extends SchemaAttribute {
  partOf: SettingControlGroupType;
  propsAllowed: string[];
  validations: ValidatorFn[];
}

export interface TriggerInformation {
  settingsControls: Dictionary<SettingControlInfo>;
  trigger: {
    handlersCount: number;
    homePage: string;
    readme?: string;
  };
}
