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
      triggers: [...validSchemas.triggers],
      resources: [...validSchemas.resources]
    };
    this.appUnderTest = cloneDeep(this.app);
  });

  it('should allow correct app', function () {
    const isValid = this.ajvContext.validate(this.appUnderTest);
    expect(isValid).to.equal(true);
    expect(this.appUnderTest).to.deep.include(this.app);
  });

  describe('properties', function () {
    describe('triggers', function () {
      ['id', 'ref'].forEach(requiredProp => {
        it(`should require ${requiredProp}`, function () {
          const triggerUnderTest = {...validSchemas.triggers};
          delete triggerUnderTest[requiredProp];
          const isValid = this.ajvContext.validate(this.appUnderTest);
          expect(isValid).to.equal(true);
          expect(this.appUnderTest).to.deep.include(this.app);
        });
      });
    });

    describe('/resources', function () {
      ['id', 'data'].forEach(requiredProp => {
        it(`should require ${requiredProp}`, function () {
          const resourceUnderTest = {...validSchemas.resources};
          delete resourceUnderTest[requiredProp];
          const isValid = this.ajvContext.validate(this.appUnderTest);
          expect(isValid).to.equal(true);
          expect(this.appUnderTest).to.deep.include(this.app);
        });
      });
    })
  });

  function generateValidSchemas() {
    const triggers = [{id: 'trigger1', ref: 'github.com/TIBCOSoftware/flogo-contrib/trigger/cli'}];
    const resources = [{id: "flow:test", data: {}}];

    return {
      triggers,
      resources
    };
  }

});
