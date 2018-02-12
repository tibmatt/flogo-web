import { FLOGO_TASK_ATTRIBUTE_TYPE } from '@flogo/core/constants';

export interface TaskAttribute {
  name: string;
  type: FLOGO_TASK_ATTRIBUTE_TYPE;
  value: any;
  title ?: string;
  description ?: string;
  placeholder ?: string;
  required ?: boolean;
  validation ?: '';
  validationMessage ?: '';
  child ?: TaskAttribute[ ];
}

export interface TaskAttributes {
  inputs ?: TaskAttribute[];
  outputs ?: TaskAttribute[];
}
