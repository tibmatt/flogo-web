import { FLOGO_ATTRIBUTE_TYPE } from '../models';

export interface IFlogoFlowDiagramTaskAttributeMapping {
  type : FLOGO_ATTRIBUTE_TYPE;
  value : string;
  mapTo ? : string;
}
