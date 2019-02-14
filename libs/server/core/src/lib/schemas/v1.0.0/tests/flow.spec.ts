import { cloneDeep } from 'lodash';

import { makeAjvContext } from './test-utils';

const triggerSchema = require('../trigger.json');
const commonSchema = require('../common.json');
const flowSchema = require('../flow.json');

describe('JSONSchema: Flow', () => {
  let testContext;

  beforeEach(() => {
    testContext = {};
  });

  const validSchemas = generateValidSchemas();

  beforeEach(() => {
    testContext.ajvContext = makeAjvContext('flow', [commonSchema, flowSchema], {
      removeAdditional: true,
    });
    testContext.validator = testContext.ajvContext.createValidator();
  });

  test('should allow correct flows', () => {
    const flow = {
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
    const isValid = testContext.ajvContext.validate(flowUnderTest);
    expect(isValid).toBe(true);
    expect(flowUnderTest).toMatchObject(flow);
  });

  describe('#/definitions', () => {
    describe('/metadataItem', () => {
      let metadataItemValidator;
      beforeEach(() => {
        metadataItemValidator = testContext.ajvContext.createValidatorForSubschema(
          'metadataItem'
        );
      });

      test('should allow correct metadata items', () => {
        metadataItemValidator
          .validateAndCreateAsserter({ ...validSchemas.metadataItem })
          .assertIsValid();
      });

      test('should require name', () => {
        metadataItemValidator
          .validateAndCreateAsserter({ type: 'number' })
          .assertIsInvalid()
          .assertHasErrorForRequiredProp('name');
      });

      test('should not allow empty name', () => {
        metadataItemValidator
          .validateAndCreateAsserter({ name: '', type: 'number' })
          .assertIsInvalid()
          .assertHasErrorForEmptyProp('name');
      });

      test('should require type', () => {
        metadataItemValidator
          .validateAndCreateAsserter({ name: 'myProp' })
          .assertIsInvalid()
          .assertHasErrorForRequiredProp('type');
      });
    });

    describe('/metadata', () => {
      let metadataValidator;
      beforeEach(() => {
        metadataValidator = testContext.ajvContext.createValidatorForSubschema(
          'metadata'
        );
      });

      test('should accept input mappings', () => {
        const action = { input: [{ ...validSchemas.metadataItem }] };
        expect(metadataValidator.validate(action)).toBe(true);
      });

      test('should accept output mappings', () => {
        const action = { output: [{ ...validSchemas.metadataItem }] };
        expect(metadataValidator.validate(action)).toBe(true);
      });

      test('should accept both input and output mappings', () => {
        const action = { ...validSchemas.metadata };
        expect(metadataValidator.validate(action)).toBe(true);
      });
    });

    describe('/activity', () => {
      let activityValidator;
      beforeEach(() => {
        activityValidator = testContext.ajvContext.createValidatorForSubschema(
          'activity'
        );
      });
      test('should allow correct activities', () => {
        activityValidator
          .validateAndCreateAsserter({ ...validSchemas.activity })
          .assertIsValid();
      });
      test('should require ref', () => {
        activityValidator
          .validateAndCreateAsserter({ type: 'number' })
          .assertIsInvalid()
          .assertHasErrorForRequiredProp('ref');
      });

      test('should require settings when activity is subflow', () => {
        const activityUnderTest = { ...validSchemas.activity };
        activityUnderTest.ref = 'github.com/TIBCOSoftware/flogo-contrib/activity/subflow';
        activityUnderTest.settings = {};
        activityValidator
          .validateAndCreateAsserter(activityUnderTest)
          .assertIsInvalid()
          .assertHasErrorForRequiredProp('.flowURI');
      });

      test('should have valid flowURI in case of subflow', () => {
        const activityUnderTest = { ...validSchemas.activity };
        activityUnderTest.ref = 'github.com/TIBCOSoftware/flogo-contrib/activity/subflow';
        activityUnderTest.settings = { flowURI: 'flowUri' };
        activityValidator
          .validateAndCreateAsserter(activityUnderTest)
          .assertIsInvalid()
          .assertHasErrorForMismatchingPattern('settings.flowURI');
      });
    });

    describe('/task', () => {
      let taskValidator;
      beforeEach(() => {
        taskValidator = testContext.ajvContext.createValidatorForSubschema('task');
      });

      test('should allow correct tasks', () => {
        const settings = {
          iterate: '$someref',
          customSettings: 'foobar',
        };
        const originalTask = { ...validSchemas.task, settings };
        const taskUnderTest = cloneDeep(originalTask);
        taskValidator.validate(taskUnderTest);
        expect(taskUnderTest).toMatchObject(originalTask);
      });

      ['id', 'activity'].forEach(requiredProp => {
        test(`should require ${requiredProp}`, () => {
          const taskUnderTest = { ...validSchemas.task };
          delete taskUnderTest[requiredProp];
          taskValidator
            .validateAndCreateAsserter(taskUnderTest)
            .assertIsInvalid()
            .assertHasErrorForRequiredProp(requiredProp);
        });
      });

      test('should not allow empty id', () => {
        taskValidator
          .validateAndCreateAsserter({ ...validSchemas.task, id: '' })
          .assertIsInvalid()
          .assertHasErrorForEmptyProp('id');
      });
    });

    describe('/link', () => {
      let linkValidator;
      beforeEach(() => {
        linkValidator = testContext.ajvContext.createValidatorForSubschema('link');
      });
      test('should allow correct links', () => {
        linkValidator.validateAndCreateAsserter({ ...validSchemas.link }).assertIsValid();
      });
      ['from', 'to'].forEach(propName => {
        test(`should require "${propName}" property`, () => {
          const linkUnderTest = { ...validSchemas.link };
          delete linkUnderTest[propName];
          linkValidator
            .validateAndCreateAsserter(linkUnderTest)
            .assertIsInvalid()
            .assertHasErrorForRequiredProp(propName);
        });
      });
      test('should allow value when type expression', () => {
        const linkUnderTest = { ...validSchemas.link };
        linkUnderTest.type = 'expression';
        linkValidator
          .validateAndCreateAsserter(linkUnderTest)
          .assertIsInvalid()
          .assertHasErrorForRequiredProp('.value');
      });

      test('should not accept invalid type', () => {
        const linkUnderTest = { ...validSchemas.link };
        const allowedValues = ['default', 'dependency', 'expression'];
        linkUnderTest.type = 'somethingElse';
        linkValidator
          .validateAndCreateAsserter(linkUnderTest)
          .assertIsInvalid()
          .assertHasErrorForMismatchingPropertyEnum('type', allowedValues);
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
