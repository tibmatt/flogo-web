import { expect } from 'chai';
import { ensureKeyOrder } from './object';

describe('common.utils.object', function () {
  describe('ensureKeyOrder()', function () {
    const objectToOrder = { baz: [], foo: 'hello', additional: 99 };
    const keyOrder = ['foo', 'bar', 'baz'];
    const reordered = ensureKeyOrder(objectToOrder, keyOrder);
    it('should reorder the fields of an object based on the provided keys order', function () {
      expect(JSON.stringify(reordered)).to.equal(JSON.stringify({ foo: 'hello', baz: [], additional: 99 }));
    });
    it('should omit specified keys in the key order that are not present in the object', function () {
      expect(Object.prototype.hasOwnProperty.call(reordered, 'bar')).to.equal(false);
    });
    it('should include the properties in the object that were not specified in the key order', function () {
      expect(reordered.additional).to.equal(99);
    });
  });
});

