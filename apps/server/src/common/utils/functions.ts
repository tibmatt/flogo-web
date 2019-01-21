/* tslint:disable:max-line-length */
export function getFunctions() {
  return [
    {
      path: 'githubPath/function/array',
      rt: {
        name: 'Array Functions',
        type: 'flogo:function',
        ref: 'dummyref/function/array',
        namespace: 'array',
        functions: [
          {
            name: 'length',
            args: [
              {
                name: 'arr',
                type: 'array',
              },
            ],
            help: {
              description: 'Returns the length of the array',
              example: 'array.length(someArray)\n Returns 3',
              usage: 'array.length(<<array>>)',
            },
          }
        ]
      }
    },
    {
      path: 'githubPath/function/string',
      rt: {
        name: 'String Functions',
        type: 'flogo:function',
        ref: 'dummyref/function/string',
        namespace: 'string',
        functions: [
          {
            name: 'concat',
            args: [
              {
                name: 'str1',
                type: 'string',
              },
              {
                name: 'str2',
                type: 'string',
                variable: true,
              },
            ],
            help: {
              description:
                'Returns the concatenation of the arguments. You can concatenate two or more strings.',
              example: "string.concat('Hello',' ', 'World')\nReturns\nHello World",
              usage: 'string.concat(<< string1 >>, << string2,... >>)\nReturn Type\nstring',
            },
            return: {type: 'string'},
          },
          {
            name: 'equals',
            args: [
              {
                name: 'str1',
                type: 'string',
              },
              {
                name: 'str2',
                type: 'string',
              },
            ],
            return: {type: 'boolean'},
            help: {
              description: 'Returns whether strings str1 and str2 are equal.',
              usage: 'string.equals(<<str1>>, <<str2>>)',
              example: "string.equals('Flogo Web', 'Flogo Web')\nReturns\ntrue",
            },
          }, {
            name: 'equalsignorecase',
            args: [
              {
                name: 'str',
                type: 'string',
              },
              {
                name: 'str2',
                type: 'string',
              },
            ],
            return: {type: 'boolean'},
            help: {
              description:
                'Compares this one string to another string, ignoring case considerations. Returns true if equal.',
              usage: 'string.equalsignorecase(<<str1>>, <<str2>>)',
              example: "string.equalsignorecase('FLOGO WEB', 'Flogo Web')\nReturns\ntrue",
            },
          },
          {
            name: 'length',
            args: [
              {
                name: 'str',
                type: 'string',
              },
            ],
            return: {type: 'integer'},
            help: {
              description: 'Returns the length of a string.',
              usage: 'string.length(<< str >>)\nReturn Type\nint',
              example: "string.length('Flogo Web')\nReturns\n9",
            },
          },
          {
            name: 'substring',
            args: [
              {
                name: 'string',
                type: 'string',
              },
              {
                name: 'position',
                type: 'integer',
              },
              {
                name: 'length',
                type: 'integer',
              },
            ],
            return: {type: 'string'},
            help: {
              description:
                'Returns a substring starting at the position specified by the second argument. Character positions are numbered from 0.',
              usage: 'string.substring(<<string>>, <<position>>, <<length>>)',
              example:
                'string.substring("Flogo is the most awesome project ever", 18, 7) \nReturns "awesome"',
            },
          },
        ]
      }
    },
    {
      path: 'githubPath/function/number',
      rt: {
        name: 'Number Functions',
        type: 'flogo:function',
        ref: 'dummyref/function/number',
        namespace: 'number',
        functions: [
          {
            name: 'random',
            args: [
              {
                name: 'limit',
                type: 'integer',
              },
            ],
            return: { type: 'integer' },
            help: {
              description:
                'Generates a pseudo-random integer number between 0 and the specified limit.',
              usage: 'number.random(<< limit >>)\nReturn Type\nint',
              example: 'number.random(10)\nReturns 9',
            },
          }
        ]
      }
    },
  ]
}
