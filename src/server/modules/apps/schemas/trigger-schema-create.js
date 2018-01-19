export function triggerSchemaCreate() {
  return {
    $schema: 'http://json-schema.org/draft-04/schema#',
    additionalProperties: false,
    type: 'object',
    required: [
      'ref',
      'name',
    ],
    properties: {
      name: {
        type: 'string',
        minLength: 1,
      },
      description: {
        type: 'string',
      },
      ref: {
        type: 'string',
      },
      settings: {
        type: 'object',
        default: {},
      },
    },
  };
}
