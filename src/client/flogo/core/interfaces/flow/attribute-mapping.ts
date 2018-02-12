import { FLOGO_TASK_ATTRIBUTE_TYPE } from 'flogo/core/constants';

export interface AttributeMapping {
  type: FLOGO_TASK_ATTRIBUTE_TYPE;
  value: any;
  mapTo: string;
}
