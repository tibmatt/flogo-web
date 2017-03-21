import Ajv from 'ajv';

class Validator {

  static validate(data) {
    const ajv = new Ajv({ removeAdditional: true, useDefaults: true, allErrors: true });
    const valid = ajv.validate(appSchema(), data);
    return valid ? null : ajv.errors;
  }

}
export { Validator };

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


function getSchema() {
  return {
    $schema: 'http://json-schema.org/draft-04/schema#',
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
        default: 'flogo:uiapp',
      },
      version: {
        type: 'string',
      },
      description: {
        type: 'string',
      },
      triggers: {
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
        type: 'array',
        items: {
          $ref: '#/definitions/ActionFlow',
        },
      },
    },
    definitions: {
      ActionFlow: {
        type: 'object',
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
              ui: {
                type: 'object',
                properties: {
                  triggerId: {
                    type: 'string',
                  },
                  handler: {
                    type: 'object',
                    settings: {
                      type: 'object',
                      default: {
                      },
                    },
                    outputs: {
                      type: 'object',
                      default: {
                      },
                    },
                  },
                },
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
      FlowCompressed: {
        type: 'object',
        properties: {
          flowCompressed: {
            type: 'string',
          },
        },
        required: [
          'flowCompressed',
        ],
      },
      FlowUri: {
        type: 'object',
        properties: {
          flowURI: {
            type: 'string',
          },
        },
        required: [
          'flowURI',
        ],
      },
    },
  };
}
