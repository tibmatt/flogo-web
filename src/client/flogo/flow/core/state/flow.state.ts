import { DiagramSelection } from '@flogo/packages/diagram';
import { UiFlow } from '@flogo/core';
import * as fromRoot from '../../../store';

export interface FlowState extends UiFlow {
  currentSelection: DiagramSelection;
}

export interface State extends fromRoot.State {
  flow: FlowState;
}
