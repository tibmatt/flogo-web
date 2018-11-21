import { expect } from 'chai';

import { makeAjvContext } from './test-utils.spec';

const commonSchema = require('../common');

describe('JSONSchema: Common', () => {
  let testContext;

  beforeEach(() => {
    testContext = {};
  });

  beforeEach(() => {
    testContext.ajvContext = makeAjvContext('common', [commonSchema]);
  });

  describe('types', () => {
    const tests = ['valueType', 'mappingType'];
    tests.forEach(defName => {
      test(`#/definitions/${defName} rejects unknown types`, () => {
        const validateValueType = testContext.ajvContext.compileDefinitionSubschema(defName);
        const isValid = validateValueType('somethingelse');
        expect(isValid).to.equal(false);
      });
    });
  });

  describe('#/definitions/mapping', () => {
    let isValidMapping;

    beforeEach(() => {
      isValidMapping = testContext.ajvContext.compileDefinitionSubschema('mapping');
    });

    test('should allow correct mappings', () => {
      expect(isValidMapping({
        type: 'literal',
        mapTo: 'someProp',
        value: 4,
      })).to.equal(true);
    });

    test('should reject incomplete mappings', () => {
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

  describe('#/definitions/mappingsCollection', () => {
    let validate;

    beforeEach(() => {
      validate = testContext.ajvContext.compileDefinitionSubschema('mappingsCollection');
    });

    test('should allow correct mappings', () => {
      expect(validate([
        { type: 'literal', mapTo: 'someProp', value: 5 },
        { type: 'expression', mapTo: 'someOtherProp', value: 'somexpr' },
      ])).to.equal(true);
    });

    test('should reject incorrect mappings', () => {
      expect(validate([
        { type: 'expression', mapTo: 'someProp', value: 'someexpr' },
        { im: 'incorrect' },
      ])).to.equal(false);
    });

    test('should accept empty collections', () => {
      expect(validate([])).to.equal(true);
    });
  });
});
