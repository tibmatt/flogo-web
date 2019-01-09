import { get } from 'lodash';
import { Validator } from '../../../common/validator/validator';
import { ActionsManagerMock } from './mocks/actions-manager-mock';
import { TestContext } from './test-context';
import { inspect } from 'util';

class Asserter {
  errors?: any;

  constructor(errors) {
    this.errors = get(errors, 'details.errors.details', null);
  }

  assertHasFailedWithError(keyword, params) {
    expect(this.errors[0]).toMatchObject({
      keyword,
      params,
    });
    return this;
  }

  assertDataWithInstanceOf(data, constructor) {
    expect(data).toBeInstanceOf(constructor);
    return this;
  }

  assertMethodCalledWithDataAsExpected(args, expected) {
    args.forEach((arg, idx) => expect(arg[1]).toMatchObject({ ...expected[idx] }));
    return this;
  }

  assertMethodReturnedWithDataAsExpected(data, expected) {
    expect({ data }).toMatchObject({ data: expected });
    return this;
  }

  assertRequiredMethodsAreDefined(spyObj) {
    spyObj.exceptions.forEach(exception => expect(exception).toBeUndefined());
    return this;
  }
}

export class AppImporterTestContext {
  appImporterFactory;
  errors?: any;

  constructor(importerFactory) {
    this.appImporterFactory = importerFactory;
    this.errors = null;
  }

  async performImport(appToImport) {
    this.errors = null;
    try {
      const importer = await this.appImporterFactory.create(appToImport);
      await importer.import(appToImport);
    } catch (errors) {
      this.errors = errors;
      // uncomment to log details
      // if (errors.details) {
      //   console.error(inspect(errors.details.errors));
      // }
    }
  }

  createAssert() {
    return new Asserter(this.errors);
  }
}

export function makeImporterContext(importerFactory) {
  return new AppImporterTestContext(importerFactory);
}

export function itBehavesLikeAnImporter(name, testContext: () => TestContext) {
  it(`should import a ${name} application`, async () => {
    await testContext().importerContext.performImport(testContext().appToImport);
    expect(testContext().importerContext.errors).toBeFalsy();
  });

  it('should throw error when invalid type of application', async () => {
    await testContext().importerContext.performImport({
      appModel: '0.0.1',
    });
    expect(testContext().importerContext.errors).toBeTruthy();
    const assert = testContext().importerContext.createAssert();
    assert.assertHasFailedWithError('cannot-identify-app-type', {
      knownTypes: [
        {
          name: 'standard',
          properties: {
            type: 'flogo:app',
            appModel: '1.0.0',
          },
        },
        {
          name: 'legacy',
          properties: {
            type: 'flogo:app',
            appModel: null,
          },
        },
      ],
    });
  });

  it('should throw error if application uses a trigger which is not recognised by the server', async () => {
    testContext().appToImport.triggers[0].ref = 'some.domain/path/to/trigger';
    await testContext().importerContext.performImport(testContext().appToImport);
    expect(testContext().importerContext.errors).toBeTruthy();
    testContext()
      .importerContext.createAssert()
      .assertHasFailedWithError('trigger-installed', {
        ref: 'some.domain/path/to/trigger',
      });
  });

  it('should throw error if application uses an activity which is not recognised by the server', async () => {
    testContext().appToImport = testContext().testOptions.updateTasksRef(
      testContext().appToImport
    );
    await testContext().importerContext.performImport(testContext().appToImport);
    const assert = testContext().importerContext.createAssert();
    expect(testContext().importerContext.errors).toBeTruthy();
    assert.assertHasFailedWithError('activity-installed', {
      ref: 'some.domain/path/to/activity',
    });
  });

  it('dependenciesFactory.create(): should create instances of necessary dependencies', async () => {
    const spyingCreateAppImporter = testContext().sinonSandbox.spy(
      testContext().importerFactory,
      'createAppImporter'
    );
    await testContext().importerContext.performImport(testContext().appToImport);
    expect(testContext().importerContext.errors).toBeFalsy();
    const assert = testContext().importerContext.createAssert();
    assert
      .assertDataWithInstanceOf(
        spyingCreateAppImporter.firstCall.args[0].actionsImporter,
        testContext().testOptions.depsConstructors.actionsImporter
      )
      .assertDataWithInstanceOf(
        spyingCreateAppImporter.firstCall.args[0].validator,
        Validator
      )
      .assertDataWithInstanceOf(
        spyingCreateAppImporter.firstCall.args[0].triggersHandlersImporter,
        testContext().testOptions.depsConstructors.triggersHandlersImporter
      );
  });

  it('ActionImporter: should implement extractActions method', async () => {
    const spyingExtractActions = testContext().sinonSandbox.spy(
      (testContext().testOptions.depsConstructors.actionsImporter as any).prototype,
      'extractActions'
    );
    await testContext().importerContext.performImport(testContext().appToImport);
    expect(testContext().importerContext.errors).toBeFalsy();
    const assert = testContext().importerContext.createAssert();
    assert.assertRequiredMethodsAreDefined(spyingExtractActions);
  });

  it('TriggerHandlerImporter: should implement required method', async () => {
    const spyingExtractTriggers = testContext().sinonSandbox.spy(
      (testContext().testOptions.depsConstructors.triggersHandlersImporter as any)
        .prototype,
      'extractTriggers'
    );
    const spyingExtractHandlers = testContext().sinonSandbox.spy(
      (testContext().testOptions.depsConstructors.triggersHandlersImporter as any)
        .prototype,
      'extractHandlers'
    );
    await testContext().importerContext.performImport(testContext().appToImport);
    const assert = testContext().importerContext.createAssert();
    expect(testContext().importerContext.errors).toBeFalsy();
    assert
      .assertRequiredMethodsAreDefined(spyingExtractTriggers)
      .assertRequiredMethodsAreDefined(spyingExtractHandlers);
  });

  it('should save actions as supported by server', async () => {
    const spyingActionCreate = testContext().sinonSandbox.spy(
      ActionsManagerMock,
      'create'
    );
    await testContext().importerContext.performImport(testContext().appToImport);
    const assert = testContext().importerContext.createAssert();
    expect(testContext().importerContext.errors).toBeFalsy();
    assert.assertMethodCalledWithDataAsExpected(
      spyingActionCreate.args,
      testContext().testOptions.expectedActions
    );
  });

  it('TriggerHandlerImporter:  should transform triggers as expected', async () => {
    const spyingTriggerExtract = testContext().sinonSandbox.spy(
      (testContext().testOptions.depsConstructors.triggersHandlersImporter as any)
        .prototype,
      'extractTriggers'
    );
    await testContext().importerContext.performImport(testContext().appToImport);
    expect(testContext().importerContext.errors).toBeFalsy();
    const assert = testContext().importerContext.createAssert();
    assert.assertMethodReturnedWithDataAsExpected(
      spyingTriggerExtract.returnValues[0],
      testContext().testOptions.expectedTriggers
    );
  });

  it('TriggerHandlerImporter:  should reconcile handlers with new action id', async () => {
    const spyingReconcileHandlers = testContext().sinonSandbox.spy(
      (testContext().testOptions.depsConstructors.triggersHandlersImporter as any)
        .prototype,
      'reconcileTriggersAndActions'
    );
    await testContext().importerContext.performImport(testContext().appToImport);
    expect(testContext().importerContext.errors).toBeFalsy();
    const assert = testContext().importerContext.createAssert();
    assert.assertMethodReturnedWithDataAsExpected(
      spyingReconcileHandlers.returnValues[0],
      testContext().testOptions.expectedReconciledTriggers
    );
  });
}
