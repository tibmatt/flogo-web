import { ContributionSchema } from '@flogo-web/core';
import { FunctionRefFinder } from './function-ref-finder';

test('It finds the functions by name', () => {
  const lookup = new FunctionRefFinder(getTestData());
  expect(lookup.findPackage('number.random')).toEqual(
    'github.com/project-flogo/contrib/function/number'
  );
  expect(lookup.findPackage('string.equalsIgnoreCase')).toEqual(
    'github.com/project-flogo/contrib/function/string'
  );
  expect(lookup.findPackage('string.float')).toEqual(
    'github.com/project-flogo/contrib/function/string'
  );
  expect(() => lookup.findPackage('unknown')).not.toThrow();
});

function getTestData(): ContributionSchema[] {
  return [
    {
      name: 'flogo-timer',
      version: '0.0.2',
      title: 'Timer',
      type: 'flogo:trigger',
      description: 'Simple Timer trigger',
      homepage: 'https://github.com/project-flogo/contrib/tree/master/trigger/timer',
      ref: 'github.com/project-flogo/contrib/trigger/timer',
      handler: {
        settings: [
          {
            name: 'startDelay',
            type: 'string',
          },
          {
            name: 'repeatInterval',
            type: 'string',
          },
        ],
      },
    },
    {
      ref: 'github.com/project-flogo/contrib/function/number',
      name: 'number',
      type: 'flogo:function',
      version: '0.0.1',
      title: 'Number Functions',
      description: 'Number Functions',
      homepage: 'https://github.com/prject-flogo/contrib/tree/master/function/number',
      functions: [
        {
          name: 'number.random',
          description: 'generate a random number',
          varArgs: true,
          args: [
            {
              name: 'limit',
              type: 'int',
            },
          ],
        },
      ],
    },
    {
      ref: 'github.com/project-flogo/contrib/function/string',
      name: 'string',
      type: 'flogo:function',
      version: '0.0.1',
      title: 'String Functions',
      description: 'String Functions',
      homepage: 'https://github.com/project-flogo/contrib/tree/master/function/string',
      functions: [
        {
          name: 'string.concat',
          description: 'concatenate a set of string',
          varArgs: true,
          args: [
            {
              name: 'str',
              type: 'string',
            },
          ],
        },
        {
          name: 'string.equals',
          description: 'check if two strings are equal',
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
        },
        {
          name: 'string.equalsIgnoreCase',
          description: 'check if two strings are equal ignoring case',
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
        },
        {
          name: 'string.float',
          description: 'convert the string to a float',
          args: [
            {
              name: 'str1',
              type: 'string',
            },
          ],
        },
        {
          name: 'string.integer',
          description: 'convert the string to an integer',
          args: [
            {
              name: 'str1',
              type: 'string',
            },
          ],
        },
        {
          name: 'string.len',
          description: 'get the length of a string',
          args: [
            {
              name: 'str1',
              type: 'string',
            },
          ],
        },
        {
          name: 'string.substring',
          description: 'get a substring from a string',
          args: [
            {
              name: 'str',
              type: 'string',
            },
            {
              name: 'start',
              type: 'string',
            },
            {
              name: 'end',
              type: 'string',
            },
          ],
        },
      ],
    },
  ];
}
