export enum FLOGO_ATTRIBUTE_TYPE {
  STRING,
  NUMBER,
  OBJECT,
  BOOLEAN,
  ARRAY
}

export interface IFlogoFlowDiagramTaskAttribute {
  name : string;
  type : FLOGO_ATTRIBUTE_TYPE;
  value : string;
  title ? : string;
  description ? : string;
  placeholder ? : string;
  required ? : boolean;
  validation ? : '';
  validationMessage ? : '';
  child ? : IFlogoFlowDiagramTaskAttribute[ ];
}

export interface IFlogoFlowDiagramTaskAttributes {
  inputs ? : IFlogoFlowDiagramTaskAttribute[ ];
  outputs ? : IFlogoFlowDiagramTaskAttribute[ ];
}
