import { Action, Dictionary, UiFlow } from '@flogo/core';
import * as fromRoot from '../../../../store';
import { CurrentSelection } from '../../models/selection';
import { Trigger, TriggerHandler, TriggerConfigureState } from '../../interfaces/index';

export interface FlowState extends UiFlow {
  isErrorPanelOpen: boolean;
  currentSelection: null | CurrentSelection;
  triggers: Dictionary<Trigger>;
  handlers: Dictionary<TriggerHandler>;
  triggerConfigure: TriggerConfigureState;
  linkedSubflows: Dictionary<Action>;
  taskConfigure: string | null;
}

export interface State extends fromRoot.State {
  flow: FlowState;
}

export const INITIAL_STATE: FlowState = {
  app: null,
  mainItems: null,
  mainGraph: null,
  errorItems: null,
  errorGraph: null,
  currentSelection: null,
  isErrorPanelOpen: false,
  schemas: {},
  handlers: {},
  triggers: {},
  linkedSubflows: {},
  triggerConfigure: null,
  taskConfigure: null,
};
