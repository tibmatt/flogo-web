import { FLOGO_ATTRIBUTE_TYPE } from '../models';

export interface IFlogoAttributeMapping {
  type: FLOGO_ATTRIBUTE_TYPE;
  value: string;
  mapTo ? : string;
}
