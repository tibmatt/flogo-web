export function triggerSchemaUpdate() {
  return {
    $schema: 'http://json-schema.org/draft-04/schema#',
    additionalProperties: false,
    type: 'object',
    properties: {
      name: {
        type: 'string',
        minLength: 1,
      },
      description: {
        type: 'string',
      },
      settings: {
        type: 'object',
      },
    },
  };
}
