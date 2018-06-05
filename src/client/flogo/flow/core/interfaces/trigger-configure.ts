import {FormGroupState} from 'ngrx-forms';
import {Dictionary} from '@flogo/core';

interface TriggerConfigureSettings {
  id: string;
  name: string;
  description: string;
  settings: {
    [id: string]: any;
  };
  handler: {
    settings: {
      [id: string]: any;
    }
  };
}
export interface TriggerConfigureState {
  selectedTrigger: string;
  settings: Dictionary<FormGroupState<TriggerConfigureSettings>>;
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
