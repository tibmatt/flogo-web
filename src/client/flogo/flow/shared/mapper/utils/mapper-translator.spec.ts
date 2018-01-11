import { MapperTranslator } from './mapper-translator';
import { MAPPING_TYPE } from '../constants';

describe('MapperTranslator', function () {

  describe('#translateMappingsIn', function() {
    const translatedMappings = MapperTranslator.translateMappingsIn([
      {
        mapTo: 'simpleNumber',
        type: MAPPING_TYPE.LITERAL_ASSIGNMENT,
        value: 1,
      },
      {
        mapTo: 'simpleString',
        type: MAPPING_TYPE.LITERAL_ASSIGNMENT,
        value: 'my string',
      },
      {
        mapTo: 'attrAssignment',
        type: MAPPING_TYPE.ATTR_ASSIGNMENT,
        value: '$activity[myActivity].attr',
      },
      {
        mapTo: 'exprAssignment',
        type: MAPPING_TYPE.EXPRESSION_ASSIGNMENT,
        value: '$activity[myActivity].attr + 4',
      },
      {
        mapTo: 'objectTemplate',
        type: MAPPING_TYPE.OBJECT_TEMPLATE,
        value: {
          'myExample': '{{ someProp }}'
        },
      },
    ]);

    describe('for literal assignments', function() {
      it('translates primitive types', function() {
        expect(translatedMappings['simpleNumber']).toEqual(jasmine.objectContaining({
          mappingType: MAPPING_TYPE.LITERAL_ASSIGNMENT,
          expression: '1',
        }));
      });
      it('translates strings', function() {
        expect(translatedMappings['simpleString']).toEqual(jasmine.objectContaining({
          mappingType: MAPPING_TYPE.LITERAL_ASSIGNMENT,
          expression: '"my string"',
        }));
      });
    });
    it('translates attribute assignments', function() {
      expect(translatedMappings['attrAssignment']).toEqual(jasmine.objectContaining({
        mappingType: MAPPING_TYPE.ATTR_ASSIGNMENT,
        expression: '$activity[myActivity].attr',
      }));
    });
    it('translates expression assignments', function() {
      expect(translatedMappings['exprAssignment']).toEqual(jasmine.objectContaining({
        mappingType: MAPPING_TYPE.EXPRESSION_ASSIGNMENT,
        expression: '$activity[myActivity].attr + 4',
      }));
    });
    it('translates object templates', function() {
      const objectMapping = translatedMappings['objectTemplate'];
      expect(objectMapping).toBeTruthy();
      expect(objectMapping.mappingType).toEqual(MAPPING_TYPE.OBJECT_TEMPLATE);
      expect(JSON.parse(objectMapping.expression)).toEqual(jasmine.objectContaining({
        myExample: '{{ someProp }}'
      }));
    });
  });

  describe('#translateMappingsOut', function() {
    const translatedMappings = MapperTranslator.translateMappingsOut({
      simpleNumber: {expression: '1.2'},
      simpleString: {expression: '"hello"'},
      resolverAssignment: {expression: '$activity[myActivity].array[0].id'},
      attrAssignment: {expression: 'myProp'},
      exprAssignment: {expression: '$activity[myActivity].attr >= 4'},
      objectTemplate: {expression: '{ "myThing": 44 }'}
    });
    const getMappingFor = (forProperty: string) => translatedMappings.find(m => m.mapTo === forProperty);
    it('Parses all mappings', function() {
      expect(translatedMappings.length).toEqual(6);
    });
    it('translates simple numbers assignments', function() {
      expect(getMappingFor('simpleNumber'))
        .toEqual(jasmine.objectContaining({
          mapTo: 'simpleNumber',
          type: MAPPING_TYPE.LITERAL_ASSIGNMENT,
          value: 1.2,
        }));
    });
    it('translates string assignments', function() {
      expect(getMappingFor('simpleString'))
        .toEqual(jasmine.objectContaining({
          mapTo: 'simpleString',
          type: MAPPING_TYPE.LITERAL_ASSIGNMENT,
          value: 'hello',
        }));
    });
    it('translates resolver assignments', function() {
      expect(getMappingFor('resolverAssignment'))
        .toEqual(jasmine.objectContaining({
          mapTo: 'resolverAssignment',
          type: MAPPING_TYPE.ATTR_ASSIGNMENT,
          value: '$activity[myActivity].array[0].id'
        }));
    });
    it('translates attribute assignments', function() {
      expect(getMappingFor('attrAssignment'))
        .toEqual(jasmine.objectContaining({
          mapTo: 'attrAssignment',
          type: MAPPING_TYPE.ATTR_ASSIGNMENT,
          value: 'myProp'
        }));
    });
    it('translates expression assignments', function() {
      expect(getMappingFor('exprAssignment'))
        .toEqual(jasmine.objectContaining({
          mapTo: 'exprAssignment',
          type: MAPPING_TYPE.EXPRESSION_ASSIGNMENT,
          value: '$activity[myActivity].attr >= 4'
        }));
    });
    it('translates object mappings', function() {
      expect(getMappingFor('objectTemplate'))
        .toEqual(jasmine.objectContaining({
          mapTo: 'objectTemplate',
          type: MAPPING_TYPE.OBJECT_TEMPLATE,
          value: jasmine.objectContaining({myThing: 44})
        }));
    });
  });

  // describe('#makeValidator', function() {
  //   const isValidExpression = MapperTranslator.makeValidator();
  //   it('creates a validator function', function() {
  //     expect(isValidExpression).toEqual(jasmine.any(Function));
  //   });
  //
  //   it('Treats empty expressions as a valid', function() {
  //     expect(isValidExpression({
  //       mappings: {
  //         something: {
  //           expression: '',
  //           mappings: {},
  //         }
  //       }
  //     })).toBeTruthy();
  //   });
  //
  //   it('Treats well formed objects as valid', function() {
  //     expect(true).toBe(true);
  //     expect(isValidExpression({
  //       mappings: {
  //         something: {
  //           expression: '{ "a": 1, "b": [1, 2]}',
  //           mappingType: MAPPING_TYPE.OBJECT_TEMPLATE,
  //           mappings: {},
  //         }
  //       }
  //     })).toBeTruthy();
  //   });
  //
  //   it('Treats incorrectly formed objects as invalid', function() {
  //     expect(isValidExpression({
  //       mappings: {
  //         something: {
  //           expression: '{ "a": 1, "b": [1, 2}',
  //           mappingType: MAPPING_TYPE.OBJECT_TEMPLATE,
  //           mappings: {},
  //         }
  //       }
  //     })).toBeFalsy();
  //   });
  //
  //   describe('For correctly formed expressions', function() {
  //     [
  //       '$a.b.c',
  //       '$activity[name]',
  //       'singleProp',
  //       '25.6',
  //       '"my string"',
  //       '$activity[hello].something > 555',
  //     ].forEach(expr => {
  //       it(`Treats ${expr} as valid`,
  //         () => expect(isValidExpression({
  //           mappings: {
  //             testMapping: {
  //               expression: expr,
  //               mappings: {}
  //             }
  //           }
  //         })).toBeTruthy());
  //     });
  //   });
  //
  //   describe('For incorrectly formed expressions', function() {
  //     [
  //       '$a.',
  //       '1.5.2',
  //       '$activity[.d',
  //       '$activity[hello].something >+ 555',
  //     ].forEach(expr => {
  //       it(`Treats ${expr} as invalid`,
  //         () => expect(isValidExpression({
  //           mappings: {
  //             testMapping: {
  //               expression: expr,
  //               mappings: {}
  //             }
  //           }
  //         })).toBeFalsy()
  //       );
  //     });
  //   });
  //
  // });
});
