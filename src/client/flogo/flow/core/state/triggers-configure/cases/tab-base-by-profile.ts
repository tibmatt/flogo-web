import { TriggerConfigureTabType } from '@flogo/flow/core';

const SETTINGS_TAB: { type: TriggerConfigureTabType, i18nKey: string } = {
  type: 'settings',
  i18nKey: 'TRIGGER-CONFIGURATOR:SETTINGS'
};

const INPUT_MAPPINGS_TAB: { type: TriggerConfigureTabType, i18nKey: string } = {
  type: 'flowInputMappings',
  i18nKey: 'TRIGGER-CONFIGURATOR:FLOW-INPUTS'
};

const OUTPUT_MAPPINGS_TAB: { type: TriggerConfigureTabType, i18nKey: string } = {
  type: 'flowOutputMappings',
  i18nKey: 'TRIGGER-CONFIGURATOR:FLOW-OUTPUTS'
};

export const getMicroServiceTabs = () => [
  { ...SETTINGS_TAB },
  { ...INPUT_MAPPINGS_TAB },
  { ...OUTPUT_MAPPINGS_TAB },
];

export const getDeviceTabs = () => [
  { ...SETTINGS_TAB },
];
