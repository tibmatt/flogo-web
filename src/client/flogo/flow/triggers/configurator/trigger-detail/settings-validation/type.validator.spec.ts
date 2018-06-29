import { booleanValidator } from './type.validator';

const shouldPass = val => expect(booleanValidator(val)).toBeFalsy(`Expected ${val} to pass the validation`);
const shouldFail = val => expect(booleanValidator(val)).toBeTruthy(`Expected ${val} to NOT pass the validation`);

describe('booleanValidator', function () {
  it('Should correctly validate boolean values', function () {
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
