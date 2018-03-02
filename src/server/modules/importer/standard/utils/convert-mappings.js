import { typeMapper } from './type-mapper';

/**
 *
 * @param mappings
 * @return {{input: any[], output: any[]}}
 */
export function convertMappingsCollection(mappings = {}) {
  return {
    input: (mappings.input || []).map(convertSingleMapping),
    output: (mappings.output || []).map(convertSingleMapping),
  };
}

export function convertSingleMapping(mapping) {
  const stdTypeMapper = typeMapper.fromStandard();
  return {
    ...mapping,
    type: stdTypeMapper.mappingTypes[mapping.type],
  };
}
