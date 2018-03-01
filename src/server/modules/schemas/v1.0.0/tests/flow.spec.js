import { expect } from 'chai';
import cloneDeep from 'lodash/cloneDeep';

import { makeAjvContext } from './test-utils.spec';

const triggerSchema = require('../trigger');
const commonSchema = require('../common');
const flowSchema = require('../flow');

describe('JSONSchema: Flow', function () {
  const validSchemas = generateValidSchemas();

  beforeEach(function () {
    this.ajvContext = makeAjvContext(
      'flow',
      [commonSchema, triggerSchema, flowSchema],
      { removeAdditional: true },
    );
    this.validator = this.ajvContext.createValidator();
  });

  it('should require id property', function () {
    const flowUnderTest = { };
    this.validator
      .validateAndCreateAsserter(flowUnderTest)
      .assertIsInvalid()
      .assertHasErrorForRequiredProp('id');
  });

  it('should not allow empty id', function () {
    const flowUnderTest = { id: '' };
    this.validator
      .validateAndCreateAsserter(flowUnderTest)
      .assertIsInvalid()
      .assertHasErrorForEmptyProp('id');
  });

  it('should allow correct flows', function () {
    const flow = {
      id: 'flow:someId',
      name: 'my cool flow',
      description: 'this is a flow description',
      metadata: { ...validSchemas.metadata },
      tasks: [{ ...validSchemas.task }],
      links: [{ ...validSchemas.link }],
      errorHandler: {
        tasks: [{ ...validSchemas.task }],
        links: [{ ...validSchemas.link }],
      },
    };
    const flowUnderTest = cloneDeep(flow);
    const isValid = this.ajvContext.validate(flowUnderTest);
    expect(isValid).to.equal(true);
    expect(flowUnderTest).to.deep.include(flow);
  });

  describe('#/definitions', function () {
    describe('/metadataItem', function () {
      let metadataItemValidator;
      beforeEach(function () {
        metadataItemValidator = this.ajvContext.createValidatorForSubschema('metadataItem');
      });

      it('should allow correct metadata items', function () {
        metadataItemValidator
          .validateAndCreateAsserter({ ...validSchemas.metadataItem })
          .assertIsValid();
      });

      it('should require name', function () {
        metadataItemValidator.validateAndCreateAsserter({ type: 'number' })
          .assertIsInvalid()
          .assertHasErrorForRequiredProp('name');
      });

      it('should not allow empty name', function () {
        metadataItemValidator.validateAndCreateAsserter({ name: '', type: 'number' })
          .assertIsInvalid()
          .assertHasErrorForEmptyProp('name');
      });

      it('should require type', function () {
        metadataItemValidator.validateAndCreateAsserter({ name: 'myProp' })
          .assertIsInvalid()
          .assertHasErrorForRequiredProp('type');
      });
    });

    describe('/metadata', function () {
      let metadataValidator;
      beforeEach(function () {
        metadataValidator = this.ajvContext.createValidatorForSubschema('metadata');
      });

      it('should accept input mappings', function () {
        const action = { input: [{ ...validSchemas.metadataItem }] };
        expect(metadataValidator.validate(action)).to.equal(true);
      });

      it('should accept output mappings', function () {
        const action = { output: [{ ...validSchemas.metadataItem }] };
        expect(metadataValidator.validate(action)).to.equal(true);
      });

      it('should accept both input and output mappings', function () {
        const action = { ...validSchemas.metadata };
        expect(metadataValidator.validate(action)).to.equal(true);
      });
    });
    xdescribe('/activity', function () {
      xit('should allow correct activities', function () {

      });
    });
    describe('/task', function () {
      let taskValidator;
      beforeEach(function () {
        taskValidator = this.ajvContext.createValidatorForSubschema('task');
      });

      it('should allow correct tasks', function () {
        const settings = {
          iterate: '$someref',
          customSettings: 'foobar',
        };
        const originalTask = { ...validSchemas.task, settings };
        const taskUnderTest = cloneDeep(originalTask);
        taskValidator.validate(taskUnderTest);
        expect(taskUnderTest).to.deep.include(originalTask);
      });

      ['id', 'activity'].forEach(requiredProp => {
        it(`should require ${requiredProp}`, function () {
          const taskUnderTest = { ...validSchemas.task };
          delete taskUnderTest[requiredProp];
          taskValidator.validateAndCreateAsserter(taskUnderTest)
            .assertIsInvalid()
            .assertHasErrorForRequiredProp(requiredProp);
        });
      });

      it('should not allow empty id', function () {
        taskValidator.validateAndCreateAsserter({ ...validSchemas.task, id: '' })
          .assertIsInvalid()
          .assertHasErrorForEmptyProp('id');
      });
    });
    xdescribe('/link', function () {
      xit('should allow correct links', function () {

      });
    });
  });

  function generateValidSchemas() {
    const link = { from: 'task_a', to: 'task_b' };
    const metadataItem = { name: 'sampleMetadata', type: 'string' };
    const metadata = {
      input: [{ ...metadataItem }],
      output: [{ ...metadataItem }],
    };
    const activity = { ref: 'github.com/flogo-contrib/activity/log' };
    const task = {
      id: 'task_a',
      activity: { ...activity },
    };

    return {
      link,
      metadata,
      metadataItem,
      task,
      activity,
    };
  }
});
