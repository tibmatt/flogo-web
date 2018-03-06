import { expect } from 'chai';

import { makeAjvContext } from './test-utils.spec';

const commonSchema = require('../common');

describe('JSONSchema: Common', function () {
  beforeEach(function () {
    this.ajvContext = makeAjvContext('common', [commonSchema]);
  });

  describe('types', function () {
    const tests = ['valueType', 'mappingType'];
    tests.forEach(defName => {
      it(`#/definitions/${defName} rejects unknown types`, function () {
        const validateValueType = this.ajvContext.compileDefinitionSubschema(defName);
        const isValid = validateValueType('somethingelse');
        expect(isValid).to.equal(false);
      });
    });
  });

  describe('#/definitions/mapping', function () {
    let isValidMapping;

    beforeEach(function () {
      isValidMapping = this.ajvContext.compileDefinitionSubschema('mapping');
    });

    it('should allow correct mappings', function () {
      expect(isValidMapping({
        type: 'literal',
        mapTo: 'someProp',
        value: 4,
      })).to.equal(true);
    });

    it('should reject incomplete mappings', function () {
      const incompleteMappings = [
        {},
        { type: 'string' },
        { type: '', mapTo: '', value: null },
        { type: 'expression', mapTo: 3, value: null },
      ];
      incompleteMappings
        .forEach((mapping, i) => expect(isValidMapping(mapping))
          .to.equal(false, `Expected mapping with index ${i} to be invalid`));
    });
  });

  describe('#/definitions/mappingsCollection', function () {
    let validate;

    beforeEach(function () {
      validate = this.ajvContext.compileDefinitionSubschema('mappingsCollection');
    });

    it('should allow correct mappings', function () {
      expect(validate([
        { type: 'literal', mapTo: 'someProp', value: 5 },
        { type: 'expression', mapTo: 'someOtherProp', value: 'somexpr' },
      ])).to.equal(true);
    });

    it('should reject incorrect mappings', function () {
      expect(validate([
        { type: 'expression', mapTo: 'someProp', value: 'someexpr' },
        { im: 'incorrect' },
      ])).to.equal(false);
    });

    it('should accept empty collections', function () {
      expect(validate([])).to.equal(true);
    });
  });
});
