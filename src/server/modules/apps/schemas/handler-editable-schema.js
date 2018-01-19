export function handlerEditableSchema() {
  return {
    $schema: 'http://json-schema.org/draft-04/schema#',
    type: 'object',
    additionalProperties: false,
    properties: {
      settings: {
        type: 'object',
      },
      outputs: {
        type: 'object',
      },
      actionMappings: {
        input: {
          $ref: '#/definitions/MappingCollection',
        },
        output: {
          $ref: '#/definitions/MappingCollection',
        },
      },
    },
    definitions: {
      MappingCollection: {
        type: 'array',
        items: {
          $ref: '#/definitions/Mapping',
        },
      },
      Mapping: {
        type: 'object',
        additionalProperties: false,
        properties: {
          type: {
            type: 'integer',
          },
          value: {},
          mapTo: {
            type: 'string',
          },
        },
        required: ['type', 'value', 'mapTo'],
      },
    },
  };
}
