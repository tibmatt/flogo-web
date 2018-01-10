import { resolveExpressionType } from './resolve-expression-type';

describe('Parser Type Resolver', function () {

  describe('for valid input', () => {
    const inputs = [
      {text: '$activity', expectedType: 'attrAccess'},
      {text: '$trigger', expectedType: 'attrAccess'},
      {text: '$regularVar.withProp', expectedType: 'attrAccess'},
      {text: '$regularVar.with.nested.props', expectedType: 'attrAccess'},
      {text: '$activity[my_activity]', expectedType: 'attrAccess'},
      {text: '$activity[myActivity].with.nested.props', expectedType: 'attrAccess'},
      {text: '$activity[myActivity].withProps', expectedType: 'attrAccess'},
      {text: '$arrayVar[0].with.props', expectedType: 'attrAccess'},
      {text: '$myVarIsAnArray[0]', expectedType: 'attrAccess'},
      {text: '$myVar.has.an.array[0]', expectedType: 'attrAccess'},
      {text: '$myVar.has.an.array[1].with.another[0].prop', expectedType: 'attrAccess'},
      {text: '$activity[my_activity].can.be.Combined.with.arrays[0]', expectedType: 'attrAccess'},
      {text: 'a25', expectedType: 'attrAccess'},
      {text: 'adadsa', expectedType: 'attrAccess'},
      {text: '$abcd', expectedType: 'attrAccess'},
      {text: '1', expectedType: 'literal'},
      {text: '1.4', expectedType: 'literal'},
      {text: '"adadsa"', expectedType: 'literal'},
      {text: '{}', expectedType: 'json'},
      {text: '{ "a": 1, "b": {"c": [{"d": "e" }]} }', expectedType: 'json'},
      {
        text: `{ "a": 1, 
        "b": {
          "c": [{"d": "e" }]
        } 
      }`, expectedType: 'json'
      },
      {text: '$a + $b', expectedType: 'expression'},
      {text: '$a + $b.c', expectedType: 'expression'},
      {text: '$a < $b.c', expectedType: 'expression'},
      {text: '$a >= $b.c', expectedType: 'expression'},
      {text: '$a < $b.c', expectedType: 'expression'},
      {text: '$a <= $b.c', expectedType: 'expression'},
      {text: '$a == $b.c', expectedType: 'expression'},
      {text: '1 + 2 + 3', expectedType: 'expression'},
      {text: '1 + 2 > 3 + $a.b.c', expectedType: 'expression'},
      {text: '$a - 3 * $a.b[0]', expectedType: 'expression'},
      {text: '$activity[my_activity].array[0].id || 45 && false', expectedType: 'expression'},
    ].forEach(function (inputData) {
      it(`correctly parses "${inputData.text}" as of type ${inputData.expectedType}`, () => {
        const parsedType = resolveExpressionType(inputData.text);
        expect(parsedType).toEqual(inputData.expectedType);
      });
    });
  });

  describe('for invalid input', () => {
    const inputs = [
      {text: '$trigger[]', expectedType: null},
      {text: '$', expectedType: null},
      {text: '$abcd.', expectedType: null},
      {text: '$abcd.e[what]', expectedType: null},
      {text: '1.4.25', expectedType: null},
      {text: '25a', expectedType: null},
      {text: '{ "a": 1, b: {} }', expectedType: null},
      {text: '{ "a": 1, b: {} ', expectedType: null},
      {text: '', expectedType: null},
      {text: '$a >', expectedType: null},
    ].forEach(function (inputData) {
      it(`dismisses "${inputData.text}" as incorrect`, () => {
        const parsedType = resolveExpressionType(inputData.text);
        expect(parsedType).toEqual(inputData.expectedType);
      });
    });

  });

});
