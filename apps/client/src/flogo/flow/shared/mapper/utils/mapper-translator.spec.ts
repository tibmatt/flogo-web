import { MapperTranslator } from './mapper-translator';
import { MAPPING_TYPE } from '../constants';

describe('MapperTranslator', function() {
  describe('#translateMappingsIn', function() {
    const translatedMappings = MapperTranslator.translateMappingsIn(
      {
        simpleNumber: '1',
        simpleFalsyValue: 'false',
        simpleString: 'my string',
        attrAssignment: '=$activity[myActivity].attr',
        exprAssignment: '=$activity[myActivity].attr + 4',
        objectTemplate: "={ \"myExample\": \"{{ someProp }}\"}"
      }
    );

    describe('for literal assignments', function() {
      it('translates primitive types', function() {
        expect(translatedMappings['simpleNumber'].expression).toEqual('1');
      });
      it('translates falsy values', function() {
        expect(translatedMappings['simpleFalsyValue'].expression).toEqual('false');
      });
      it('translates strings', function() {
        expect(translatedMappings['simpleString'].expression).toEqual('my string');
      });
    });
    it('translates attribute assignments', function() {
      expect(translatedMappings['attrAssignment'].expression).toEqual('$activity[myActivity].attr');
    });
    it('translates expression assignments', function() {
      expect(translatedMappings['exprAssignment'].expression).toEqual('$activity[myActivity].attr + 4');
    });
    it('translates object templates', function() {
      const objectMapping = translatedMappings['objectTemplate'];
      expect(objectMapping).toBeTruthy();
      expect(JSON.parse(objectMapping.expression)).toEqual(
        jasmine.objectContaining({
          'myExample': '{{ someProp }}',
        })
      );
    });
  });

  describe('#translateMappingsOut', function() {
    const translatedMappings = MapperTranslator.translateMappingsOut({
      simpleNumber: { expression: '1.2' },
      simpleString: { expression: '"hello"' },
      resolverAssignment: { expression: '$activity[myActivity].array[0].id' },
      attrAssignment: { expression: 'myProp' },
      exprAssignment: { expression: '$activity[myActivity].attr >= 4' },
      objectTemplate: { expression: '{ "myThing": 44 }' },
    });
    it('Parses all mappings', function() {
      expect(Object.keys(translatedMappings).length).toEqual(6);
    });
    it('translates simple numbers assignments', function() {
      expect(translatedMappings['simpleNumber']).toEqual('1.2');
    });
    it('translates string assignments', function() {
      expect(translatedMappings['simpleString']).toEqual( '"hello"');
    });
    it('translates resolver assignments', function() {
      expect(translatedMappings['resolverAssignment']).toEqual('=$activity[myActivity].array[0].id');
    });
    it('translates attribute assignments', function() {
      expect(translatedMappings['attrAssignment']).toEqual('=myProp');
    });
    it('translates expression assignments', function() {
      expect(translatedMappings['exprAssignment']).toEqual('=$activity[myActivity].attr >= 4');
    });
    it('translates object mappings', function() {
      expect(translatedMappings['objectTemplate']).toEqual('={ "myThing": 44 }' );
    });
  });

  describe('#makeValidator', function() {
    const isValidExpression = MapperTranslator.makeValidator();
    it('creates a validator function', function() {
      expect(isValidExpression).toEqual(jasmine.any(Function));
    });

    it('Treats empty expressions as a valid', function() {
      expect(
        isValidExpression({
          something: {
            expression: '',
            mappings: {},
          },
        })
      ).toBeTruthy();
    });

    it('Treats well formed objects as valid', function() {
      expect(true).toBe(true);
      expect(
        isValidExpression({
          something: {
            expression: '{ "a": 1, "b": [1, 2]}',
            mappingType: MAPPING_TYPE.OBJECT_TEMPLATE,
            mappings: {},
          },
        })
      ).toBeTruthy();
    });

    it('Treats incorrectly formed objects as invalid', function() {
      expect(
        isValidExpression({
          something: {
            expression: '{ "a": 1, "b": [1, 2}',
            mappingType: MAPPING_TYPE.OBJECT_TEMPLATE,
            mappings: {},
          },
        })
      ).toBeFalsy();
    });

    describe('For correctly formed expressions', function() {
      [
        '$a.b.c',
        '$activity[name]',
        'singleProp',
        '25.6',
        '"my string"',
        '$activity[hello].something > 555',
      ].forEach(expr => {
        it(`Treats ${expr} as valid`, () =>
          expect(
            isValidExpression({
              testMapping: {
                expression: expr,
                mappings: {},
              },
            })
          ).toBeTruthy());
      });
    });

    describe('For incorrectly formed expressions', function() {
      ['$a.', '1.5.2', '$activity[.d', '$activity[hello].something >+ 555'].forEach(
        expr => {
          it(`Treats ${expr} as invalid`, () =>
            expect(
              isValidExpression({
                testMapping: {
                  expression: expr,
                  mappings: {},
                },
              })
            ).toBeFalsy());
        }
      );
    });
  });
});
