import { TriggerSchema } from '@flogo/core';

export interface TriggerConfigureSettings {
  groupId: 'settings';
  id: string;
  name: string;
  description: string;
  trigger: {
    [id: string]: any;
  };
  handler: {
    [id: string]: any;
  };
}

export interface TriggerConfigureMappings {
  groupId: 'flowInputMappings' | 'flowOutputMappings';
  mappings: { [field: string]: string };
}

export interface  TriggerConfigureGroup {
  id: string;
  settings?: TriggerConfigureSettings;
  inputMappings?: TriggerConfigureMappings;
  outputMappings?: TriggerConfigureMappings;
}

export interface TriggerConfigureGroups {
  [triggerId: string]: TriggerConfigureGroup;
}

interface TriggerConfigureTrigger {
  name: string;
  tabs: string[];
  isValid: boolean;
  isDirty: boolean;
}

interface TriggerConfigureTabs {
  triggerId: string;
  type: TriggerConfigureTabType;
  i18nLabelKey: string;
  isValid: boolean;
  isDirty: boolean;
  isEnabled: boolean;
}

interface TriggerConfigureField {
  isDirty: boolean;
  isValid: boolean;
  isEnabled: boolean;
  value: string;
  errors?: any;
  parsedMetadata?: {
    type: string;
    parsedValue: any;
    parsedDetails?: any;
  };
}

interface TriggerConfigureFields {
  [fieldName: string]: TriggerConfigureField;
}

export type TriggerConfigureTabType = 'settings' | 'flowInputMappings' | 'flowOutputMappings';
export interface TriggerConfigureState {
  isOpen: boolean;
  selectedTriggerId: string;
  currentTab: TriggerConfigureTabType;
  schemas: { [triggerRef: string]: TriggerSchema };
  triggers: {
    [triggerId: string]: TriggerConfigureTrigger;
  };
  tabs: {
    [tabsId: string]: TriggerConfigureTabs;
  };
  fields: {
    [fieldId: string]: TriggerConfigureFields;
  };
}
