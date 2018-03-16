import { ValueType } from '@flogo/core';

export abstract class BaseField<T> {
  name: string;
  type: ValueType;
  value: T;
  // making required defaulted to true only for the case of Input metadata
  required = true;
  controlType: string;

  constructor(options: {
    name?: string,
    type?: ValueType,
    value?: any,
    required?: boolean,
    controlType?: string
  } = {}) {
    this.name = options.name;
    this.type = options.type;
    this.value = options.value;
    this.controlType = options.controlType || '';
  }
}
