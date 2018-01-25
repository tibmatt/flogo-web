import { IFlogoFlowDiagramTaskAttributeMapping } from '../../shared/diagram/models/attribute-mapping.model';

export interface InputMapperConfig {
  propsToMap: any[];
  inputScope: any[];
  inputMappings: IFlogoFlowDiagramTaskAttributeMapping[];
}
