/**
 * @param mappings
 * @return {{input: any[], output: any[]}}
 */
export function convertMappingsCollection(mappingTypesDictionary, mappings = {}) {
  const convertSingleMapping = mapping => portMappingType(mappingTypesDictionary, mapping);
  return {
    input: (mappings.input || []).map(convertSingleMapping),
    output: (mappings.output || []).map(convertSingleMapping),
  };
}

export function portMappingType(mappingTypesDictionary, mapping) {
  return {
    ...mapping,
    type: mappingTypesDictionary[mapping.type],
  };
}
