import {FLOGO_TASK_ATTRIBUTE_TYPE} from '../constants';

export abstract class BaseField<T> {
  name: string;
  type: FLOGO_TASK_ATTRIBUTE_TYPE;
  value: T;
  // making required defaulted to true only for the case of Input metadata
  required = true;
  controlType: string;

  constructor(options: {
    name?: string,
    type?: FLOGO_TASK_ATTRIBUTE_TYPE,
    value?: any,
    required?: boolean,
    controlType?: string
  } = {}) {
    this.name = options.name;
    this.type = options.type;
    this.value = options.value || '';
    this.controlType = options.controlType || '';
  }
}
