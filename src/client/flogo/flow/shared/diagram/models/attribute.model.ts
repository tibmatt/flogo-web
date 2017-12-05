import { FLOGO_TASK_ATTRIBUTE_TYPE } from '@flogo/core/constants';

export interface IFlogoFlowDiagramTaskAttribute {
  name: string;
  type: FLOGO_TASK_ATTRIBUTE_TYPE;
  value: string;
  title ?: string;
  description ?: string;
  placeholder ?: string;
  required ?: boolean;
  validation ?: '';
  validationMessage ?: '';
  child ?: IFlogoFlowDiagramTaskAttribute[ ];
}

export interface IFlogoFlowDiagramTaskAttributes {
  inputs ?: IFlogoFlowDiagramTaskAttribute[ ];
  outputs ?: IFlogoFlowDiagramTaskAttribute[ ];
}
