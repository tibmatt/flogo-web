export function fullAppSchema() {
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
          additionalProperties: false,
          properties: {
            id: {
              type: 'string',
            },
            ref: {
              type: 'string',
              'trigger-installed': true,
            },
            name: {
              type: 'string',
            },
            description: {
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
                    default: {},
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
      ActionMetadata: {
        type: 'object',
        additionalProperties: false,
        properties: {
          input: {
            $ref: '#/definitions/ActionMetadata/definitions/AttributeCollection',
          },
          output: {
            $ref: '#/definitions/ActionMetadata/definitions/AttributeCollection',
          },
        },
        definitions: {
          AttributeCollection: {
            type: 'array',
            items: {
              $ref: '#/definitions/ActionMetadata/definitions/Attribute',
            },
          },
          Attribute: {
            type: 'object',
            additionalProperties: false,
            properties: {
              name: {
                type: 'string',
              },
              type: {
                type: 'string',
              },
            },
            required: ['name', 'type'],
          },
        },
      },
      ActionFlow: {
        type: 'object',
        additionalProperties: false,
        properties: {
          id: {
            type: 'string',
          },
          description: {
            type: 'string',
          },
          ref: {
            type: 'string',
          },
          metadata: {
            $ref: '#/definitions/ActionMetadata',
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
          name: {
            type: 'string',
          },
          description: {
            type: 'string',
          },
          ref: {
            type: 'string',
          },
          type: {
            type: 'integer',
          },
          explicitReply: {
            type: 'boolean',
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
            $ref: '#/definitions/Flow/definitions/rootTask',
          },
          errorHandlerTask: {
            title: 'errorHandlerTask',
            $ref: '#/definitions/Flow/definitions/rootTask',
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
                  'complex_object',
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
              value: {},
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
                type: 'string',
              },
              id: {
                type: 'integer',
              },
              from: {
                type: ['integer', 'string'],
              },
              to: {
                type: ['integer', 'string'],
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
                type: ['integer', 'string'],
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
                'activity-installed': true,
              },
              flowRef: {
                type: 'string',
              },
              settings: {
                title: 'settings',
                type: 'object',
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
            anyOf: [{
              properties: {
                type: { enum: [4] },
              },
              required: ['id', 'flowRef'],
            }, {
              properties: {
                type: { enum: [0, 1, 2, 3] },
              },
              required: ['id', 'activityRef'],
            }],
          },
          rootTask: {
            title: 'rootTask',
            type: 'object',
            additionalProperties: false,
            properties: {
              id: {
                type: ['integer', 'string'],
              },
              type: {
                type: 'integer',
              },
              attributes: {
                type: 'array',
                default: [],
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
