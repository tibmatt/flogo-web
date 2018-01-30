export function appSchema() {
  return {
    $schema: 'http://json-schema.org/draft-04/schema#',
    additionalProperties: false,
    type: 'object',
    required: [
      'name',
      'type',
    ],
    properties: {
      name: {
        type: 'string',
        minLength: 1,
        'x-notEmpty': true,
      },
      description: {
        type: 'string',
      },
      type: {
        type: 'string',
        default: 'flogo:uiapp',
      },
      version: {
        type: 'string',
        default: '0.1.0',
      },
    },
  };
}
