export function deviceAppSchema() {
  return {
    $schema: 'http://json-schema.org/draft-04/schema#',
    additionalProperties: false,
    type: 'object',
    required: [
      'name',
      'type',
      'device',
    ],
    properties: {
      name: {
        type: 'string',
        minLength: 1,
      },
      description: {
        type: 'string',
      },
      type: {
        type: 'string',
        default: 'flogo:device',
      },
      device: {
        type: 'object',
        required: [
          'profile',
        ],
        properties: {
          profile: {
            type: 'string',
          },
          deviceType: {
            type: 'string',
            default: 'Feather M0 WIFI',
          },
          settings: {
            type: 'object',
          },
        },
      },
      version: {
        type: 'string',
        default: '0.1.0',
      },
    },
  };
}
