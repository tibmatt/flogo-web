import { normalizeHandlerMappings } from './normalize-handler-mappings';
import { MAPPING_EXPRESSION_TYPE } from '../../../common/constants';

describe('importer.common.normalize-handler-mappings', () => {
  test('handles handlers without actionMappings', () => {
    [
      {},
      { actionMappings: null },
      { actionMappings: {} },
      { actionMappings: { input: [] } },
      { actionMappings: { output: [] } },
    ].forEach(testCase => expect(normalizeHandlerMappings(testCase)).toBeTruthy());
  });

  test('prefixes assign mappings', () => {
    const result = normalizeHandlerMappings({
      actionMappings: {
        input: [
          {
            value: 'fromTrigger',
            type: MAPPING_EXPRESSION_TYPE.ASSIGN,
            mapTo: 'field1',
          },
          {
            value: 'property.subaccess',
            type: MAPPING_EXPRESSION_TYPE.ASSIGN,
            mapTo: 'field2',
          },
          {
            value: 'property.someArray[0]',
            type: MAPPING_EXPRESSION_TYPE.ASSIGN,
            mapTo: 'field3',
          },
          {
            value: '$.alreadyPrefixed',
            type: MAPPING_EXPRESSION_TYPE.ASSIGN,
            mapTo: 'field4',
          },
          {
            value: '$activity[myActivity].foo.bar',
            type: MAPPING_EXPRESSION_TYPE.ASSIGN,
            mapTo: 'field5',
          },
        ],
        output: [
          {
            value: 'fromFlow',
            type: MAPPING_EXPRESSION_TYPE.ASSIGN,
            mapTo: 'field1',
          },
          {
            value: 'property.subaccess',
            type: MAPPING_EXPRESSION_TYPE.EXPRESSION,
            mapTo: 'field2',
          },
          {
            value: { x: '1' },
            type: MAPPING_EXPRESSION_TYPE.OBJECT,
            mapTo: 'field3',
          },
          {
            value: 'foobar',
            type: MAPPING_EXPRESSION_TYPE.LITERAL,
            mapTo: 'field4',
          },
        ],
      },
    });

    expect(result.actionMappings).toEqual({
      input: {
        field1: '=$.fromTrigger',
        field2: '=$.property.subaccess',
        field3: '=$.property.someArray[0]',
        field4: '=$.alreadyPrefixed',
        field5: '=$activity[myActivity].foo.bar',
      },
      output: {
        field1: '=$.fromFlow',
        field2: '=property.subaccess',
        field3: '={"x":"1"}',
        field4: 'foobar',
      },
    });
  });
});
