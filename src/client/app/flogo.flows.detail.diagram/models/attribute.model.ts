export enum FLOGO_ATTRIBUTE_TYPE {
  STRING,
  NUMBER,
  OBJECT,
  BOOLEAN,
  ARRAY
};

export interface IFlogoAttribute {
  name: string;
  type: FLOGO_ATTRIBUTE_TYPE;
  value: string;
  title ? : string;
  description ? : string;
  placeholder ? : string;
  required ? : boolean;
  validation ? : '';
  validationMessage ? : '';
  child ? : IFlogoAttribute[ ];
};

export interface IFlogoAttributes {
  inputs ? : IFlogoAttribute[ ];
  outputs ? : IFlogoAttribute[ ];
}
