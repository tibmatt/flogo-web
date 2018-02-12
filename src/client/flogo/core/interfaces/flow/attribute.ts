import { ValueTypes } from '../../constants';

export interface TaskAttribute {
  name: string;
  type: ValueTypes.ValueType;
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
