import { expect } from 'chai';
import { resolveExpressionType } from './resolve-expression-type';

describe('Parser Type Resolver', function () {

  function assertParsedType(inputData) {
    it(`For ${inputData.text}`, () => {
      const parsedType = resolveExpressionType(inputData.text);
      expect(parsedType).to.equal(inputData.expectedType, `Expected ${inputData.expectedType} but got ${parsedType}`);
    });
  }

  describe('for valid input', () => {
    describe('it correctly determines its type', () => {
      [
        {text: '$.inputName', expectedType: 'attrAccess'},
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
        {text: '$env[MY_ENV_PROP]', expectedType: 'attrAccess'},
        {text: '$property[i.want.to.namespace.my.props]', expectedType: 'attrAccess'},
        {text: 'string.cooncat($property[i.want.to.namespace.my.props],"qwerty")', expectedType: 'expression'},
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
        {text: `{ "a": "{{ $activity[xyz].result.id }}" }`, expectedType: 'json'},
        {text: `{ "foo": ["{{ string.concat($activity[hello].world, $flow.a[0]) }}"] }`, expectedType: 'json'},
        {text: '$.inputName != 2', expectedType: 'expression'},
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
        {text: 'isDefined()', expectedType: 'expression'},
        {text: 'string.concat("a", 1, $.input, $activity[xyz].someProp, otherFuncCall(2))', expectedType: 'expression'},
        {text: 'a ? b : c', expectedType: 'expression'},
        {text: '1 > 5 ? "hello" : $activity[a].b', expectedType: 'expression'}
      ].forEach(assertParsedType);
    });
  });

  describe('for invalid input', () => {
    describe('dismisses incorrect expressions', () => {
      [
        {text: '$trigger[]', expectedType: null},
        {text: '$abcd.', expectedType: null},
        {text: '$abcd.e[what]', expectedType: null},
        {text: '1.4.25', expectedType: null},
        {text: '25a', expectedType: null},
        {text: '{ "a": 1, b: {} }', expectedType: null},
        {text: '{ "a": 1, b: {} ', expectedType: null},
        {text: '', expectedType: null},
        {text: '$a >', expectedType: null},
        {text: `{ "a": "{{}}" }`, expectedType: null},
        {text: `a ? 4`, expectedType: null},
        {text: `1 > ? a : b`, expectedType: null},
        {text: `true ? a`, expectedType: null},
      ].forEach(assertParsedType);
    });
  });

});
