import {expect} from 'chai';
import cloneDeep from 'lodash/cloneDeep';
import {makeAjvContext} from './test-utils.spec';

const triggerSchema = require('../trigger');
const commonSchema = require('../common');
const flowSchema = require('../flow');
const appSchema = require('../app');

describe('JSONSchema: App', function () {
  const validSchemas = generateValidSchemas();
  beforeEach(function () {
    this.ajvContext = makeAjvContext(
      'app',
      [commonSchema, triggerSchema, flowSchema, appSchema],
      {removeAdditional: true},
    );
    this.validator = this.ajvContext.createValidator();
    this.app = {
      name: 'my app',
      type: 'flogo:app',
      version: '0.5.3',
      appModel: '1.0.0',
      description: 'app description',
      triggers: [{...validSchemas.trigger}],
      resources: [{...validSchemas.resource}]
    };
    this.appUnderTest = cloneDeep(this.app);
  });

  it('should allow correct app', function () {
    const isValid = this.ajvContext.validate(this.appUnderTest);
    expect(isValid).to.equal(true);
    expect(this.appUnderTest).to.deep.include(this.app);
  });

  ['name', 'type', 'appModel'].forEach(requiredProp => {
    it(`should require ${requiredProp}`, function () {
      delete this.appUnderTest[requiredProp];
      this.validator.validateAndCreateAsserter(this.appUnderTest)
        .assertIsInvalid()
        .assertHasErrorForRequiredProp(requiredProp);
    });
  });

  describe('properties', function () {

    describe('/resources', function () {
      let resourceValidator;
      beforeEach(function () {
        resourceValidator = this.ajvContext.createValidatorForSubschema('resource');
      });
      ['data', 'id'].forEach(requiredProp => {
        it(`should require ${requiredProp}`, function () {
          const resourceUnderTest = {...validSchemas.resource};
          delete resourceUnderTest[requiredProp];
          resourceValidator.validateAndCreateAsserter(resourceUnderTest)
            .assertIsInvalid()
            .assertHasErrorForRequiredProp(requiredProp);
        });
      });
      it(`should have valid resources ID `, function () {
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
