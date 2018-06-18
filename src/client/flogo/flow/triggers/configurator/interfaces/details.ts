import {
  TriggerConfigureTab,
  TriggerConfigureField,
  TriggerConfigureFields,
  TriggerConfigureTabType
} from '@flogo/flow/core';
import {TriggerSchema} from '@flogo/core';

export interface ConfigureTriggerDetails {
  tabs: TriggerConfigureTab[];
  fields: {
    [tabName in TriggerConfigureTabType]: {
      [fieldName: string]: TriggerConfigureFields | TriggerConfigureField
    };
  };
  schema: TriggerSchema;
}
