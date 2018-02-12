import { ValueTypes } from './constants';

describe('ValueType constants', function() {
  const allTypes = [...ValueTypes.allTypes];
  allTypes.forEach(type => {
    it(`Should define a default value for ${type}`, () => {
      expect(ValueTypes.defaultValueForType.has(type))
        .toBeTruthy(`Default value for ${type} is not defined`);
    });
  });
});
