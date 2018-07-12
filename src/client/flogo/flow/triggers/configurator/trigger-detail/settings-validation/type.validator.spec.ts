import {arrayValidator, booleanValidator, getNumberValidator, getObjectValidator} from './type.validator';
import {ValueType} from '@flogo/core';

const makeExpectationFunctions = validatorFunction => ({
  shouldPass: val => expect(validatorFunction(val)).toBeFalsy(`Expected ${val} to pass the validation`),
  shouldFail: val => expect(validatorFunction(val)).toBeTruthy(`Expected ${val} to NOT pass the validation`)
});

describe('booleanValidator', function () {
  it('Should correctly validate boolean values', function () {
    const {shouldPass, shouldFail} = makeExpectationFunctions(booleanValidator);

    shouldPass(true);
    shouldPass(false);

    shouldFail(undefined);
    shouldFail(null);
    shouldFail('abcdef');
    shouldFail('true');
    shouldFail('false');
    shouldFail(1234);
    shouldFail('');
    shouldFail(0);
    shouldFail({});
  });
});

describe('arrayValidator', function () {
  it('Should correctly validate array values', function () {
    const {shouldPass, shouldFail} = makeExpectationFunctions(arrayValidator);

    shouldPass([]);
    shouldPass([1, 'a', 'b']);

    shouldFail(undefined);
    shouldFail(null);
    shouldFail('abcdef');
    shouldFail('true');
    shouldFail('false');
    shouldFail(1234);
    shouldFail('');
    shouldFail(0);
    shouldFail({});
    shouldFail('[]');
    shouldFail('["a"]');
    shouldFail('1, a, b');
  });
});

describe('numberValidator', function () {
  it('Should correctly validate number values', function () {
    const {shouldPass, shouldFail} = makeExpectationFunctions(getNumberValidator(ValueType.Integer));

    shouldPass(1);
    shouldPass(23423433);
    shouldPass(23.234);
    shouldPass(Math.PI);

    shouldFail(undefined);
    shouldFail(null);
    shouldFail('abcdef');
    shouldFail('true');
    shouldFail('1234dsdsaf');
    shouldFail('aaf23423');
    shouldFail('');
    shouldFail({});
    shouldFail(true);
    shouldFail(false);
  });
});

describe('getObjectValidator', function () {
  it('Should correctly validate object values', function () {
    const {shouldPass, shouldFail} = makeExpectationFunctions(getObjectValidator(ValueType.Object));

    shouldPass({});
    shouldPass({'a': 32424});

    shouldFail(undefined);
    shouldFail(null);
    shouldFail('abcdef');
    shouldFail('true');
    shouldFail(1234);
    shouldFail('');
    shouldFail(0);
    shouldFail(true);
  });
});
