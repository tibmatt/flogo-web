import { DiagramSelection } from '@flogo/packages/diagram';
import { UiFlow } from '@flogo/core';
import * as fromRoot from '../../../store';

export interface FlowState extends UiFlow {
  isErrorPanelOpen: boolean;
  currentSelection: DiagramSelection;
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
};
