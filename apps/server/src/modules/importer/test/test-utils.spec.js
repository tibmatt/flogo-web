import get from "lodash/get";
import {Validator} from "../../../common/validator/validator";
import {ActionsManagerMock} from "./mocks/actions-manager-mock";

class Asserter {
  constructor(isSuccessful, errors) {
    this.isSuccessful = isSuccessful;
    this.errors = get(errors, "details.errors.details", null);
  }

  assertIsSuccessful() {
    expect(this.isSuccessful).toBe(true);
    return this;
  }

  assertIsFailed() {
    expect(this.isSuccessful).toBe(false);
    return this;
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
    args.forEach((arg, idx) => expect(arg[1]).toMatchObject({...expected[idx]}));
    return this;
  }

  assertMethodReturnedWithDataAsExpected(data, expected) {
    expect({data}).toMatchObject({data: expected});
    return this;
  }

  assertRequiredMethodsAreDefined(spyObj) {
    spyObj.exceptions.forEach(exception => expect(exception).toBeUndefined());
    return this;
  }
}

class AppImporterTestContext {
  constructor(importerFactory) {
    this.appImporterFactory = importerFactory;
    this.isSuccess = false;
    this.errors = null;
  }

  async importAndCreateAssert(appToImport) {
    try {
      await this.importApp(appToImport);
      this.isSuccess = true;
    } catch(errors) {
      this.isSuccess = false;
      this.errors = errors;
    }
    return this.createAssert();
  }

  async importApp(appData) {
    const importer = await this.appImporterFactory.create(appData);
    await importer.import(appData);
  }

  createAssert() {
    return new Asserter(this.isSuccess, this.errors);
  }
}

export function makeImporterContext(importerFactory) {
  return new AppImporterTestContext(importerFactory);
}

export function commonTestCases(name, testContext, testLifeCycle) {
  if (testLifeCycle) {
    beforeAll(testLifeCycle.beforeAll);
    beforeEach(testLifeCycle.beforeEach);
    afterEach(testLifeCycle.afterEach);
  }

  test(`should import a ${name} application`, async () => {
    const assert = await testContext.importerContext.importAndCreateAssert(this.appToImport);
    assert.assertIsSuccessful();
  });

  test('should throw error when invalid type of application', async () => {
    const assert = await testContext.importerContext.importAndCreateAssert({appModel: "0.0.1"});
    assert.assertIsFailed()
      .assertHasFailedWithError('cannot-identify-app-type', {
        "knownTypes": [
          {
            "name": "standard",
            "properties": {
              "type": "flogo:app",
              "appModel": "1.0.0"
            }
          },
          {
            "name": "device",
            "properties": {
              "type": "flogo:app:device"
            }
          },
          {
            "name": "legacy",
            "properties": {
              "type": "flogo:app",
              "appModel": null
            }
          }
        ]
      });
  });

  test(
    'should throw error if application uses a trigger which is not recognised by the server',
    async () => {
      testContext.appToImport.triggers[0].ref = "some.domain/path/to/trigger";
      const assert = await testContext.importerContext.importAndCreateAssert(testContext.appToImport);
      assert.assertIsFailed()
        .assertHasFailedWithError('trigger-installed', {
          "ref": "some.domain/path/to/trigger"
        });
    }
  );

  test(
    'should throw error if application uses an activity which is not recognised by the server',
    async () => {
      testContext.appToImport = testContext.testOptions.updateTasksRef(testContext.appToImport);
      const assert = await testContext.importerContext.importAndCreateAssert(testContext.appToImport);
      assert.assertIsFailed()
        .assertHasFailedWithError('activity-installed', {
          "ref": "some.domain/path/to/activity"
        });
    }
  );

  test(
    "dependenciesFactory.create(): should create instances of necessary dependencies",
    async () => {
      const spyingCreateAppImporter = testContext.sinonSandbox.spy(testContext.importerFactory, "createAppImporter");
      const assert = await testContext.importerContext.importAndCreateAssert(testContext.appToImport);
      assert.assertIsSuccessful()
        .assertDataWithInstanceOf(spyingCreateAppImporter.firstCall.args[0].actionsImporter, testContext.testOptions.depsConstructors.actionsImporter)
        .assertDataWithInstanceOf(spyingCreateAppImporter.firstCall.args[0].validator, Validator)
        .assertDataWithInstanceOf(spyingCreateAppImporter.firstCall.args[0].triggersHandlersImporter, testContext.testOptions.depsConstructors.triggersHandlersImporter);
    }
  );

  test("ActionImporter: should implement extractActions method", async () => {
    const spyingExtractActions = testContext.sinonSandbox.spy(testContext.testOptions.depsConstructors.actionsImporter.prototype, "extractActions");
    const assert = await testContext.importerContext.importAndCreateAssert(testContext.appToImport);
    assert.assertRequiredMethodsAreDefined(spyingExtractActions)
      .assertIsSuccessful();
  });

  test("TriggerHandlerImporter: should implement required method", async () => {
    const spyingExtractTriggers = testContext.sinonSandbox.spy(testContext.testOptions.depsConstructors.triggersHandlersImporter.prototype, "extractTriggers");
    const spyingExtractHandlers = testContext.sinonSandbox.spy(testContext.testOptions.depsConstructors.triggersHandlersImporter.prototype, "extractHandlers");
    const assert = await testContext.importerContext.importAndCreateAssert(testContext.appToImport);
    assert.assertRequiredMethodsAreDefined(spyingExtractTriggers)
      .assertRequiredMethodsAreDefined(spyingExtractHandlers)
      .assertIsSuccessful();
  });

  test("should save actions as supported by server", async () => {
    const spyingActionCreate = testContext.sinonSandbox.spy(ActionsManagerMock, "create");
    const assert = await testContext.importerContext.importAndCreateAssert(testContext.appToImport);
    assert.assertIsSuccessful()
      .assertMethodCalledWithDataAsExpected(spyingActionCreate.args, testContext.testOptions.expectedActions);
  });

  test(
    "TriggerHandlerImporter:  should transform triggers as expected",
    async () => {
      const spyingTriggerExtract = testContext.sinonSandbox.spy(testContext.testOptions.depsConstructors.triggersHandlersImporter.prototype, "extractTriggers");
      const assert = await testContext.importerContext.importAndCreateAssert(testContext.appToImport);
      assert.assertIsSuccessful()
        .assertMethodReturnedWithDataAsExpected(spyingTriggerExtract.returnValues[0], testContext.testOptions.expectedTriggers);
    }
  );

  test(
    "TriggerHandlerImporter:  should reconcile handlers with new action id",
    async () => {
      const spyingReconcileHandlers = testContext.sinonSandbox.spy(testContext.testOptions.depsConstructors.triggersHandlersImporter.prototype, "reconcileTriggersAndActions");
      const assert = await testContext.importerContext.importAndCreateAssert(testContext.appToImport);
      assert.assertIsSuccessful()
        .assertMethodReturnedWithDataAsExpected(spyingReconcileHandlers.returnValues[0], testContext.testOptions.expectedReconciledTriggers);
    }
  );

}
