export function triggerDeviceSchemaCreate() {
  return {
    $schema: 'http://json-schema.org/draft-04/schema#',
    additionalProperties: false,
    type: 'object',
    required: [
      'ref',
      'name',
      'type',
    ],
    properties: {
      name: {
        type: 'string',
        minLength: 1,
      },
      description: {
        type: 'string',
      },
      title: {
        type: 'string',
      },
      type: {
        type: 'string',
      },
      version: {
        type: 'string',
      },
      ref: {
        type: 'string',
      },
      settings: {
        type: 'array',
        default: [],
      },
      outputs: {
        type: 'array',
        default: [],
      },
      device_support: {
        type: 'array',
        default: [],
      },
    },
  };
}
