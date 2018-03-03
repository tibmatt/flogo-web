export function portMappings(fromMappings = {}) {
  const { input = [], output = [] } = fromMappings;
  return {
    input: input.map(formatSingleMapping),
    output: output.map(formatSingleMapping),
  };
}

function formatSingleMapping(mapping) {
  return {
    ...mapping,
    // todo: portedtype
    type: 'assign', // todo: mapping.type,
  };
}

