import { IMapExpression } from '@flogo/flow/shared/mapper';
import { MapperTranslator } from './mapper-translator';
import { MAPPING_TYPE } from '../constants';

describe('MapperTranslator', function () {

  describe('#translateMappingsIn', () => {
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

    describe('for literal assignments', () => {
      it('translates primitive types', () => {
        expect(translatedMappings['simpleNumber']).toEqual(jasmine.objectContaining({
          mappingType: MAPPING_TYPE.LITERAL_ASSIGNMENT,
          expression: '1',
        }));
      });
      it('translates strings', () => {
        expect(translatedMappings['simpleString']).toEqual(jasmine.objectContaining({
          mappingType: MAPPING_TYPE.LITERAL_ASSIGNMENT,
          expression: '"my string"',
        }));
      });
    });
    it('translates attribute assignments', () => {
      expect(translatedMappings['attrAssignment']).toEqual(jasmine.objectContaining({
        mappingType: MAPPING_TYPE.ATTR_ASSIGNMENT,
        expression: '$activity[myActivity].attr',
      }));
    });
    it('translates expression assignments', () => {
      expect(translatedMappings['exprAssignment']).toEqual(jasmine.objectContaining({
        mappingType: MAPPING_TYPE.EXPRESSION_ASSIGNMENT,
        expression: '$activity[myActivity].attr + 4',
      }));
    });
    it('translates object templates', () => {
      const objectMapping = translatedMappings['objectTemplate'];
      expect(objectMapping).toBeTruthy();
      expect(objectMapping.mappingType).toEqual(MAPPING_TYPE.OBJECT_TEMPLATE);
      expect(JSON.parse(objectMapping.expression)).toEqual(jasmine.objectContaining({
        myExample: '{{ someProp }}'
      }));
    });
  });

  describe('#translateMappingsOut', () => {
    const translatedMappings = MapperTranslator.translateMappingsOut({
      simpleNumber: {expression: '1.2'},
      simpleString: {expression: '"hello"'},
      resolverAssignment: {expression: '$activity[myActivity].array[0].id'},
      attrAssignment: {expression: 'myProp'},
      exprAssignment: {expression: '$activity[myActivity].attr >= 4'},
      objectTemplate: {expression: '{ "myThing": 44 }'}
    });
    const getMappingFor = (forProperty: string) => translatedMappings.find(m => m.mapTo === forProperty);
    it('Parses all mappings', () => {
      expect(translatedMappings.length).toEqual(6);
    });
    it('translates simple numbers assignments', () => {
      expect(getMappingFor('simpleNumber'))
        .toEqual(jasmine.objectContaining({
          mapTo: 'simpleNumber',
          type: MAPPING_TYPE.LITERAL_ASSIGNMENT,
          value: 1.2,
        }));
    });
    it('translates string assignments', () => {
      expect(getMappingFor('simpleString'))
        .toEqual(jasmine.objectContaining({
          mapTo: 'simpleString',
          type: MAPPING_TYPE.LITERAL_ASSIGNMENT,
          value: 'hello',
        }));
    });
    it('translates resolver assignments', () => {
      expect(getMappingFor('resolverAssignment'))
        .toEqual(jasmine.objectContaining({
          mapTo: 'resolverAssignment',
          type: MAPPING_TYPE.ATTR_ASSIGNMENT,
          value: '$activity[myActivity].array[0].id'
        }));
    });
    it('translates attribute assignments', () => {
      expect(getMappingFor('attrAssignment'))
        .toEqual(jasmine.objectContaining({
          mapTo: 'attrAssignment',
          type: MAPPING_TYPE.ATTR_ASSIGNMENT,
          value: 'myProp'
        }));
    });
    it('translates expression assignments', () => {
      expect(getMappingFor('exprAssignment'))
        .toEqual(jasmine.objectContaining({
          mapTo: 'exprAssignment',
          type: MAPPING_TYPE.EXPRESSION_ASSIGNMENT,
          value: '$activity[myActivity].attr >= 4'
        }));
    });
    it('translates object mappings', () => {
      expect(getMappingFor('objectTemplate'))
        .toEqual(jasmine.objectContaining({
          mapTo: 'objectTemplate',
          type: MAPPING_TYPE.OBJECT_TEMPLATE,
          value: jasmine.objectContaining({myThing: 44})
        }));
    });
  });

  // describe('#makeValidator', () => {
  //   const validatorFn = MapperTranslator.makeValidator();
  //   it('creates a validator function', () => {
  //     expect(validatorFn).toEqual(jasmine.any(Function));
  //   });
  //
  //   const makeMappingHolder = (propName: string, expression: string) => (<IMapExpression>{ mappings: {
  //     [propName]: { expression, mappings: {} } }
  //   });
  //
  //   it('Treats empty expressions as a valid', () => {
  //     expect(validatorFn(makeMappingHolder('something', ''))).toBeFalsy();
  //   });
  //
  // });
});
