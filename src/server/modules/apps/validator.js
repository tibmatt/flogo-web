import defaults from 'lodash/defaults';
import Ajv from 'ajv';

function validate(schema, data, options = {}) {
  const ajv = new Ajv(options);
  const valid = ajv.validate(schema, data);
  return valid ? null : ajv.errors;
}

class Validator {

  static validateSimpleApp(data) {
    return validate(appSchema(), data, { removeAdditional: true, useDefaults: true, allErrors: true });
  }

  static validateTriggerCreate(data) {
    return validate(triggerSchemaCreate(), data, { removeAdditional: true, useDefaults: true, allErrors: true });
  }

  static validateTriggerUpdate(data) {
    return validate(triggerSchemaUpdate(), data, { removeAdditional: true, useDefaults: true, allErrors: true });
  }

  static validateHandler(data) {
    return validate(handlerEditableSchema(), data, { removeAdditional: true, useDefaults: true, allErrors: true });
  }

  static validateFullApp(data, options) {
    options = defaults({}, options, { removeAdditional: false, useDefaults: false, allErrors: true });
    console.log(options);
    return validate(fullAppSchema(), data, options);
  }

}


export { Validator };

function triggerSchemaCreate() {
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

function triggerSchemaUpdate() {
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

function appSchema() {
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

function handlerEditableSchema() {
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
    },
  };
}

function fullAppSchema() {
  return {
    $schema: 'http://json-schema.org/draft-04/schema#',
    additionalProperties: false,
    type: 'object',
    required: [
      'name',
      'type',
      'version',
      'triggers',
      'actions',
    ],
    properties: {
      name: {
        type: 'string',
      },
      type: {
        type: 'string',
        default: 'flogo:app',
      },
      version: {
        type: 'string',
      },
      description: {
        type: 'string',
      },
      triggers: {
        additionalProperties: false,
        default: [],
        type: 'array',
        items: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
            },
            ref: {
              type: 'string',
            },
            settings: {
              type: 'object',
              default: null,
            },
            handlers: {
              type: 'array',
              items: {
                type: 'object',
                additionalProperties: false,
                properties: {
                  actionId: {
                    type: 'string',
                  },
                  settings: {
                    type: 'object',
                    default: {
                    },
                  },
                },
                required: [
                  'actionId',
                  'settings',
                ],
              },
            },
          },
          required: [
            'id',
            'ref',
            'settings',
            'handlers',
          ],
        },
      },
      actions: {
        default: [],
        type: 'array',
        items: {
          $ref: '#/definitions/ActionFlow',
        },
      },
    },
    definitions: {
      ActionFlow: {
        type: 'object',
        additionalProperties: false,
        properties: {
          id: {
            type: 'string',
          },
          name: {
            type: 'string',
          },
          ref: {
            type: 'string',
          },
          data: {
            type: 'object',
            properties: {
              flow: {
                $ref: '#/definitions/Flow',
              },
            },
          },
        },
        required: [
          'id',
          'ref',
          'data',
        ],
      },
      Flow: {
        title: 'flow',
        type: 'object',
        additionalProperties: false,
        properties: {
          id: {
            type: 'string',
          },
          ref: {
            type: 'string',
          },
          type: {
            type: 'integer',
          },
          attributes: {
            type: 'array',
            items: {
              $ref: '#/definitions/Flow/definitions/attribute',
            },
          },
          inputMappings: {
            type: 'array',
            items: {
              $ref: '#/definitions/Flow/definitions/mapping',
            },
          },
          rootTask: {
            title: 'rootTask',
            $ref: '#/definitions/Flow/definitions/task',
          },
          errorHandlerTask: {
            title: 'errorHandlerTask',
            $ref: '#/definitions/Flow/definitions/task',
          },
        },
        required: [
          'rootTask',
        ],
        definitions: {
          attribute: {
            title: 'attribute',
            type: 'object',
            properties: {
              name: {
                type: 'string',
              },
              type: {
                enum: [
                  'string',
                  'integer',
                  'number',
                  'boolean',
                  'object',
                  'array',
                  'params',
                  'any',
                ],
              },
              value: {
                type: [
                  'string',
                  'integer',
                  'number',
                  'boolean',
                  'object',
                  'array',
                  'null',
                ],
              },
            },
            required: [
              'name',
              'type',
              'value',
            ],
          },
          mapping: {
            title: 'mapping',
            type: 'object',
            properties: {
              type: {
                type: 'integer',
              },
              value: {
                type: 'string',
              },
              mapTo: {
                type: 'string',
              },
            },
            required: [
              'type',
              'value',
              'mapTo',
            ],
          },
          link: {
            title: 'link',
            type: 'object',
            properties: {
              name: {
                name: 'string',
              },
              id: {
                type: 'integer',
              },
              from: {
                type: 'integer',
              },
              to: {
                type: 'integer',
              },
              type: {
                type: 'integer',
              },
              value: {
                type: 'string',
              },
            },
            required: [
              'id',
              'from',
              'to',
            ],
          },
          task: {
            title: 'task',
            type: 'object',
            properties: {
              id: {
                type: 'integer',
              },
              type: {
                type: 'integer',
              },
              name: {
                type: 'string',
              },
              title: {
                type: 'string',
              },
              description: {
                type: 'string',
              },
              activityRef: {
                type: 'string',
              },
              attributes: {
                type: 'array',
                items: {
                  $ref: '#/definitions/Flow/definitions/attribute',
                },
              },
              inputMappings: {
                type: 'array',
                items: {
                  $ref: '#/definitions/Flow/definitions/mapping',
                },
              },
              outputMappings: {
                type: 'array',
                items: {
                  $ref: '#/definitions/Flow/definitions/mapping',
                },
              },
              tasks: {
                type: 'array',
                items: {
                  $ref: '#/definitions/Flow/definitions/task',
                },
              },
              links: {
                type: 'array',
                items: {
                  $ref: '#/definitions/Flow/definitions/link',
                },
              },
            },
            required: [
              'id',
            ],
          },
        },
      },
      FlowEmbedded: {
        type: 'object',
        properties: {
          flow: {
            $ref: '#/definitions/Flow',
          },
        },
        required: [
          'flow',
        ],
      },
    },
  };
}
