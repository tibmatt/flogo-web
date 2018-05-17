import { UiFlow } from '@flogo/core';
import * as fromRoot from '../../../store';
import { CurrentSelection } from '../models/selection';

export interface FlowState extends UiFlow {
  isErrorPanelOpen: boolean;
  currentSelection: null | CurrentSelection;
  // todo: trigger interface?
  triggers: any[];
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
  triggers: [],
};
