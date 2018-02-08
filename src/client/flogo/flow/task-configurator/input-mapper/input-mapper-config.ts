import { AttributeMapping } from '@flogo/core';

export interface InputMapperConfig {
  propsToMap: any[];
  inputScope: any[];
  inputMappings: AttributeMapping[];
}
