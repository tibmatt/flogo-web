import { typeMapper } from '../../../transfer/common/type-mapper';
import * as convertMappings from '../../../transfer/common/convert-mappings';

export const fromStandardTypeMapper = typeMapper.fromStandard();

export const convertMappingsCollection = mappings => convertMappings
  .convertMappingsCollection(fromStandardTypeMapper.mappingTypes, mappings);

export const portMappingType = singleMapping => convertMappings
  .convertMappingsCollection(fromStandardTypeMapper.mappingTypes, singleMapping);

export * from './parse-resource-uri';
