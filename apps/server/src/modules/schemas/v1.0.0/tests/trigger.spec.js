import { expect } from 'chai';

import { makeAjvContext } from './test-utils.spec';

const triggerSchema = require('../trigger');
const commonSchema = require('../common');

describe('JSONSchema: Trigger', () => {
  let testContext;

  beforeEach(() => {
    testContext = {};
  });

  const validFlowData = { flowURI: 'res://flow:example' };
  const validMapping = { type: 'literal', mapTo: 'someProp', value: 5 };
  const actionWithoutMappings = { ref: 'github.com/TIBCOSoftware/flogo-contrib/action/flow', data: { ...validFlowData } };
  const validAction = {
    ...actionWithoutMappings,
    mappings: {
      input: [{ ...validMapping }],
      output: [{ ...validMapping }],
    },
  };
  const validTrigger = {
    id: 'handlerId',
    ref: 'github.com/TIBCOSoftware/flogo-contrib/trigger/timer',
    handlers: [{ action: { ...validAction } }],
  };

  beforeEach(() => {
    testContext.ajvContext = makeAjvContext('trigger', [commonSchema, triggerSchema]);
  });

  ['id', 'ref'].forEach(propName => {
    test(`should require "${propName}" property`, () => {
      const triggerUnderTest = { ...validTrigger };
      delete triggerUnderTest[propName];
      testContext.ajvContext.createValidator()
        .validateAndCreateAsserter(triggerUnderTest)
        .assertIsInvalid()
        .assertHasErrorForRequiredProp(propName);
    });
  });

  test('should allow correct triggers', () => {
    const isValid = testContext.ajvContext.validate(validTrigger);
    expect(isValid).to.equal(true);
  });

  test('handlers should be an array', () => {
    const triggerUnderTest = { ...validTrigger, handlers: {} };
    testContext.ajvContext.createValidator()
      .validateAndCreateAsserter(triggerUnderTest)
      .assertIsInvalid()
      .assertHasErrorForMismatchingPropertyType('handlers', 'array');
  });

  describe('#/definitions', () => {
    describe('/flowData', () => {
      let validate;
      beforeEach(() => {
        validate = testContext.ajvContext.compileDefinitionSubschema('flowData');
      });

      test('should not allow empty refs', () => {
        expect(validate({})).to.equal(false);
        expect(validate(null)).to.equal(false);
      });

      test('flowURI is required', () => {
        expect(validate({ flowURI: '' })).to.equal(false);
        expect(validate({ flowURI: null })).to.equal(false);
      });

      test('should allow correct values', () => {
        expect(validate({ flowURI: 'res://flow:example' })).to.equal(true);
      });
    });

    describe('/action', () => {
      let validator;

      beforeEach(() => {
        validator = testContext.ajvContext.createValidatorForSubschema('action');
      });

      test('should require data', () => {
        validator
          .validateAndCreateAsserter({ ref: 'xyz' })
          .assertIsInvalid()
          .assertHasErrorForRequiredProp('data');
      });

      test('should accept input mappings', () => {
        const action = { ...actionWithoutMappings, mappings: { input: [{ ...validMapping }] } };
        expect(validator.validate(action)).to.equal(true);
      });

      test('should accept output mappings', () => {
        const action = { ...actionWithoutMappings, mappings: { output: [{ ...validMapping }] } };
        expect(validator.validate(action)).to.equal(true);
      });

      test('should accept both input and output mappings', () => {
        const action = { ...validAction };
        expect(validator.validate(action)).to.equal(true);
      });
    });

    describe('/handler', () => {
      let validator;
      beforeEach(() => {
        validator = testContext.ajvContext.createValidatorForSubschema('handler');
      });

      test('should require action', () => {
        validator
          .validateAndCreateAsserter({ settings: {} })
          .assertIsInvalid()
          .assertHasErrorForRequiredProp('action');
      });

      test('should accept empty settings', () => {
        const isValid = validator.validate({ action: { ...validAction }, settings: {} });
        expect(isValid).to.equal(true);
      });

      test('should accept any settings', () => {
        const isValid = validator.validate({
          action: { ...validAction },
          settings: {
            a: 1,
            b: 'xyz',
            c: { foo: 'bar' },
          },
        });
        expect(isValid).to.equal(true);
      });

      test(
        'when using removeAdditional option all settings should be preserved',
        () => {
          const validateAndRemoveAdditional = testContext.ajvContext
            .cloneContext({ removeAdditional: true })
            .compileDefinitionSubschema('handler');
          const settings = {
            a: 1,
            b: 'xyz',
            c: { foo: 'bar' },
          };
          const actionUnderTest = {
            action: { ...validAction },
            unknownProp: 22,
            settings: { ...settings },
          };
          const isValid = validateAndRemoveAdditional(actionUnderTest);
          expect(isValid).to.equal(true);
          expect(actionUnderTest).to.not.have.key('unknownProp');
          expect(actionUnderTest.settings).to.deep.include(settings);
        }
      );
    });
  });
});
