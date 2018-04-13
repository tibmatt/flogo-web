import { Observable } from 'rxjs/Observable';
import 'rxjs/observable/of';

import { IMapExpression, IMapFunctionsLookup, IMapping, ISchemaProvider } from '../models';

export class StaticMapperContextFactory {
  static create(inputSchema: any, outputSchema: any, mappings: {[lhs: string]: IMapExpression}) {
    return {
      getMapFunctionsProvider(): IMapFunctionsLookup {
        return {
          getFunctions() {
            return Observable.of({
              'string': {
                'type': 'namespace',
                'functions': {
                  'concat': {
                    'name': 'concat',
                    'args': [
                      {
                        'name': 'str1',
                        'type': 'string'
                      },
                      {
                        'name': 'str2',
                        'type': 'string',
                        'variable': true
                      }
                    ],
                    'help': {
                      'description': 'Returns the concatenation of the arguments. You can concatenate two or more strings.',
                      'example': 'string.concat(\'Hello\',\' \', \'World\')\nReturns\nHello World',
                      'usage': 'string.concat(<< string1 >>, << string2,... >>)\nReturn Type\nstring'
                    },
                    'return': {'type': 'string'}
                  },
                  'equals': {
                    'name': 'equals',
                    'args': [
                      {
                        'name': 'str',
                        'type': 'string'
                      },
                      {
                        'name': 'str2',
                        'type': 'string'
                      }
                    ],
                    'return': {'type': 'boolean'},
                    'help': {
                      'description': 'Returns whether those two string are equals.',
                      'usage': 'string.equals(<< str >>, <<str2>>)\nReturn Type\nboolean',
                      'example': 'string.equals(\'Flogo Web\', \'Flogo Web\')\nReturns\ntrue'
                    }
                  },
                  'length': {
                    'name': 'length',
                    'args': [{
                      'name': 'str',
                      'type': 'string'
                    }],
                    'return': {'type': 'integer'},
                    'help': {
                      'description': 'Returns the length of a string.',
                      'usage': 'string.length(<< str >>)\nReturn Type\nint',
                      'example': 'string.length(\'Flogo Web\')\nReturns\n9'
                    }
                  }

                }
              },
              'number': {
                'type': 'namespace',
                'functions': {
                  'random': {
                    'name': 'random',
                    'args': [{
                      'name': 'limit',
                      'type': 'integer'
                    }],
                    'return': {'type': 'integer'},
                    'help': {
                      'description': 'Generates a pseudo-random integer number between 0 and the specified limit.',
                      'usage': 'number.random(<< limit >>)\nReturn Type\nint',
                      'example': 'number.random(10)\nReturns 9'
                    }
                  }
                }
              }
            });
          },
          isValidFunction() {
            // throw new Error('not implemented');
            return true;
          },
          getFunction() {
            throw new Error('not implemented');
          }
        };
      },
      getScopedOutputSchemaProvider(): ISchemaProvider {
        return {
          getSchema: () => outputSchema
        };
      },
      getContextInputSchemaProvider(): ISchemaProvider {
        return {
          getSchema: () => inputSchema
        };
      },
      getContextData() {
        return {};
      },
      getMapping(): IMapping {
        return {
          mappings
        };
      }
    };
  }
}
