import { FormGroupState } from 'ngrx-forms';
import { Dictionary, TriggerSchema } from '@flogo/core';

export interface TriggerConfigureSettings {
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

export interface TriggerConfigureState {
  selectedTriggerId: string;
  schemas: Dictionary<TriggerSchema>;
  triggersForm: FormGroupState<Dictionary<TriggerConfigureSettings>>;
}

/*const FORM_ID = 'triggerConfigureForm';

export const initialSettingsState = createFormGroupState<TriggerConfigureSettings>(FORM_ID, {
  id: '',
  name: '',
  description: '',
  settings: {},
  handler: {
    settings: {}
  }
});*/
