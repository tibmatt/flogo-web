import { DiagramSelection } from '@flogo/packages/diagram';
import { UiFlow } from '@flogo/core';

export interface FlowState extends UiFlow {
  currentSelection: DiagramSelection;
}
