import { expect } from 'chai';

import { makeAjvContext } from './test-utils.spec';

const triggerSchema = require('../trigger');
const commonSchema = require('../common');

describe('JSONSchema: Trigger', function () {
  const validFlowData = { flowURI: 'res://flow:example' };
  const validMapping = { type: 'literal', mapTo: 'someProp', value: 5 };
  const actionWithoutMappings = { ref: 'github.com/TIBCOSoftware/flogo-contrib/action/flow', data: { ...validFlowData } };
  const validAction = {
    ...actionWithoutMappings,
    input: [{ ...validMapping }],
    output: [{ ...validMapping }],
  };
  const validTrigger = {
    id: 'handlerId',
    ref: 'github.com/TIBCOSoftware/flogo-contrib/trigger/timer',
    handlers: [{ action: { ...validAction } }],
  };

  beforeEach(function () {
    this.ajvContext = makeAjvContext('trigger', [commonSchema, triggerSchema]);
  });

  ['id', 'ref'].forEach(propName => {
    it(`should require "${propName}" property`, function () {
      const triggerUnderTest = { ...validTrigger };
      delete triggerUnderTest[propName];
      this.ajvContext.createValidator()
        .validateAndCreateAsserter(triggerUnderTest)
        .assertIsInvalid()
        .assertHasErrorForRequiredProp(propName);
    });
  });

  it('should allow correct triggers', function () {
    const isValid = this.ajvContext.validate(validTrigger);
    expect(isValid).to.equal(true);
  });

  it('handlers should be an array', function () {
    const triggerUnderTest = { ...validTrigger, handlers: {} };
    this.ajvContext.createValidator()
      .validateAndCreateAsserter(triggerUnderTest)
      .assertIsInvalid()
      .assertHasErrorForMismatchingPropertyType('handlers', 'array');
  });

  describe('#/definitions', function () {
    describe('/flowData', function () {
      let validate;
      beforeEach(function () {
        validate = this.ajvContext.compileDefinitionSubschema('flowData');
      });

      it('should not allow empty refs', function () {
        expect(validate({})).to.equal(false);
        expect(validate(null)).to.equal(false);
      });

      it('flowURI is required', function () {
        expect(validate({ flowURI: '' })).to.equal(false);
        expect(validate({ flowURI: null })).to.equal(false);
      });

      it('should allow correct values', function () {
        expect(validate({ flowURI: 'res://flow:example' })).to.equal(true);
      });
    });

    describe('/action', function () {
      let validator;

      beforeEach(function () {
        validator = this.ajvContext.createValidatorForSubschema('action');
      });

      it('should require ref', function () {
        validator
          .validateAndCreateAsserter({ data: validFlowData })
          .assertIsInvalid()
          .assertHasErrorForRequiredProp('ref');
      });

      it('should not allow an empty ref', function () {
        validator
          .validateAndCreateAsserter({ ref: '', data: validFlowData })
          .assertIsInvalid()
          .assertHasErrorForEmptyProp('ref');
      });

      it('should require data', function () {
        validator
          .validateAndCreateAsserter({ ref: 'xyz' })
          .assertIsInvalid()
          .assertHasErrorForRequiredProp('data');
      });

      it('should accept input mappings', function () {
        const action = { ...actionWithoutMappings, input: [{ ...validMapping }] };
        expect(validator.validate(action)).to.equal(true);
      });

      it('should accept output mappings', function () {
        const action = { ...actionWithoutMappings, output: [{ ...validMapping }] };
        expect(validator.validate(action)).to.equal(true);
      });

      it('should accept both input and output mappings', function () {
        const action = { ...validAction };
        expect(validator.validate(action)).to.equal(true);
      });
    });

    describe('/handler', function () {
      let validator;
      beforeEach(function () {
        validator = this.ajvContext.createValidatorForSubschema('handler');
      });

      it('should require action', function () {
        validator
          .validateAndCreateAsserter({ settings: {} })
          .assertIsInvalid()
          .assertHasErrorForRequiredProp('action');
      });

      it('should accept empty settings', function () {
        const isValid = validator.validate({ action: { ...validAction }, settings: {} });
        expect(isValid).to.equal(true);
      });

      it('should accept any settings', function () {
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

      it('when using removeAdditional option all settings should be preserved', function () {
        const validateAndRemoveAdditional = this.ajvContext
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
      });
    });
  });
});
