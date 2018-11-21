import {expect} from 'chai';
import cloneDeep from 'lodash/cloneDeep';
import {makeAjvContext} from './test-utils.spec';

const triggerSchema = require('../trigger');
const commonSchema = require('../common');
const flowSchema = require('../flow');
const appSchema = require('../app');

describe('JSONSchema: App', () => {
  let testContext;

  beforeEach(() => {
    testContext = {};
  });

  const validSchemas = generateValidSchemas();
  beforeEach(() => {
    testContext.ajvContext = makeAjvContext(
      'app',
      [commonSchema, triggerSchema, flowSchema, appSchema],
      {removeAdditional: true},
    );
    testContext.validator = testContext.ajvContext.createValidator();
    testContext.app = {
      name: 'my app',
      type: 'flogo:app',
      version: '0.5.3',
      appModel: '1.0.0',
      description: 'app description',
      triggers: [{...validSchemas.trigger}],
      resources: [{...validSchemas.resource}]
    };
    testContext.appUnderTest = cloneDeep(testContext.app);
  });

  test('should allow correct app', () => {
    const isValid = testContext.ajvContext.validate(testContext.appUnderTest);
    expect(isValid).to.equal(true);
    expect(testContext.appUnderTest).to.deep.include(testContext.app);
  });

  ['name', 'type', 'appModel'].forEach(requiredProp => {
    test(`should require ${requiredProp}`, () => {
      delete testContext.appUnderTest[requiredProp];
      testContext.validator.validateAndCreateAsserter(testContext.appUnderTest)
        .assertIsInvalid()
        .assertHasErrorForRequiredProp(requiredProp);
    });
  });

  describe('properties', () => {

    describe('/resources', () => {
      let resourceValidator;
      beforeEach(() => {
        resourceValidator = testContext.ajvContext.createValidatorForSubschema('resource');
      });
      ['data', 'id'].forEach(requiredProp => {
        test(`should require ${requiredProp}`, () => {
          const resourceUnderTest = {...validSchemas.resource};
          delete resourceUnderTest[requiredProp];
          resourceValidator.validateAndCreateAsserter(resourceUnderTest)
            .assertIsInvalid()
            .assertHasErrorForRequiredProp(requiredProp);
        });
      });
      test(`should have valid resources ID `, () => {
        const resourceUnderTest = {...validSchemas.resource};
        resourceUnderTest.id = 'flowId';
        resourceValidator.validateAndCreateAsserter(resourceUnderTest)
          .assertIsInvalid()
          .assertHasErrorForMismatchingPattern('id');
      });
    });
  });
  function generateValidSchemas() {
    const trigger = {id: 'trigger1', ref: 'github.com/TIBCOSoftware/flogo-contrib/trigger/cli'};
    const resource = {id: "flow:test", data: {}};

    return {
      trigger,
      resource
    };
  }
});
