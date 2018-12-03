import { ValueType } from '@flogo-web/client/core';
import { ValidatorFn, Validator } from '@angular/forms';

export abstract class BaseField<T> {
  name: string;
  type: ValueType;
  value: T;
  required = false;
  controlType: string;
  validators?: Array<Validator | ValidatorFn>;

  constructor(
    options: {
      name?: string;
      type?: ValueType;
      value?: any;
      required?: boolean;
      controlType?: string;
    } = {}
  ) {
    this.name = options.name;
    this.type = options.type;
    this.value = options.value;
    this.controlType = options.controlType || '';
    this.required = options.required;
  }
}
