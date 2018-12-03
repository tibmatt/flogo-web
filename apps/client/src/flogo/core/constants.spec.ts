import { ValueType } from './constants';

describe('ValueType constants', function() {
  const allTypes = [...ValueType.allTypes];
  allTypes.forEach(type => {
    it(`Should define a default value for ${type}`, () => {
      expect(ValueType.defaultValueForType.has(type)).toBeTruthy(`Default value for ${type} is not defined`);
    });
  });
});
