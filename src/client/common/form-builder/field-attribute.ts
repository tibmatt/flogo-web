import {FLOGO_TASK_ATTRIBUTE_TYPE} from '../constants';

export interface FieldAttribute {
  name: string;
  type: FLOGO_TASK_ATTRIBUTE_TYPE | string;
  value?: any;
}
