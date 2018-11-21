import {expect} from "chai";
import get from "lodash/get";
import {Validator} from "../../../common/validator/validator";
import {ActionsManagerMock} from "./mocks/actions-manager-mock";

class Asserter {
  constructor(isSuccessful, errors) {
    this.isSuccessful = isSuccessful;
    this.errors = get(errors, "details.errors.details", null);
  }

  assertIsSuccessful() {
    expect(this.isSuccessful).to.equal(true);
    return this;
  }

  assertIsFailed() {
    expect(this.isSuccessful).to.equal(false);
    return this;
  }

  assertHasFailedWithError(keyword, params) {
    expect(this.errors[0]).to.deep.include({
      keyword,
      params,
    });
    return this;
  }

  assertDataWithInstanceOf(data, constructor) {
    expect(data).to.be.an.instanceOf(constructor);
    return this;
  }

  assertMethodCalledWithDataAsExpected(args, expected) {
    args.forEach((arg, idx) => expect(arg[1]).to.deep.include({...expected[idx]}));
    return this;
  }

  assertMethodReturnedWithDataAsExpected(data, expected) {
    expect({data}).to.deep.include({data: expected});
    return this;
  }

  assertRequiredMethodsAreDefined(spyObj) {
    spyObj.exceptions.forEach(exception => expect(exception).to.equal(undefined));
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

export function commonTestCases(name) {
  test(`should import a ${name} application`, async () => {
    const assert = await this.importerContext.importAndCreateAssert(this.appToImport);
    assert.assertIsSuccessful();
  });

  test('should throw error when invalid type of application', async () => {
    const assert = await this.importerContext.importAndCreateAssert({appModel: "0.0.1"});
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
      this.appToImport.triggers[0].ref = "some.domain/path/to/trigger";
      const assert = await this.importerContext.importAndCreateAssert(this.appToImport);
      assert.assertIsFailed()
        .assertHasFailedWithError('trigger-installed', {
          "ref": "some.domain/path/to/trigger"
        });
    }
  );

  test(
    'should throw error if application uses an activity which is not recognised by the server',
    async () => {
      this.appToImport = this.testOptions.updateTasksRef(this.appToImport);
      const assert = await this.importerContext.importAndCreateAssert(this.appToImport);
      assert.assertIsFailed()
        .assertHasFailedWithError('activity-installed', {
          "ref": "some.domain/path/to/activity"
        });
    }
  );

  test(
    "dependenciesFactory.create(): should create instances of necessary dependencies",
    async () => {
      const spyingCreateAppImporter = this.sinonSandbox.spy(this.importerFactory, "createAppImporter");
      const assert = await this.importerContext.importAndCreateAssert(this.appToImport);
      assert.assertIsSuccessful()
        .assertDataWithInstanceOf(spyingCreateAppImporter.firstCall.args[0].actionsImporter, this.testOptions.depsConstructors.actionsImporter)
        .assertDataWithInstanceOf(spyingCreateAppImporter.firstCall.args[0].validator, Validator)
        .assertDataWithInstanceOf(spyingCreateAppImporter.firstCall.args[0].triggersHandlersImporter, this.testOptions.depsConstructors.triggersHandlersImporter);
    }
  );

  test(
    "ActionImporter: should implement extractActions method",
    async () => {
      const spyingExtractActions = this.sinonSandbox.spy(this.testOptions.depsConstructors.actionsImporter.prototype, "extractActions");
      const assert = await this.importerContext.importAndCreateAssert(this.appToImport);
      assert.assertRequiredMethodsAreDefined(spyingExtractActions)
        .assertIsSuccessful();
    }
  );

  test(
    "TriggerHandlerImporter: should implement required method",
    async () => {
      const spyingExtractTriggers = this.sinonSandbox.spy(this.testOptions.depsConstructors.triggersHandlersImporter.prototype, "extractTriggers");
      const spyingExtractHandlers = this.sinonSandbox.spy(this.testOptions.depsConstructors.triggersHandlersImporter.prototype, "extractHandlers");
      const assert = await this.importerContext.importAndCreateAssert(this.appToImport);
      assert.assertRequiredMethodsAreDefined(spyingExtractTriggers)
        .assertRequiredMethodsAreDefined(spyingExtractHandlers)
        .assertIsSuccessful();
    }
  );

  test("should save actions as supported by server", async () => {
    const spyingActionCreate = this.sinonSandbox.spy(ActionsManagerMock, "create");
    const assert = await this.importerContext.importAndCreateAssert(this.appToImport);
    assert.assertIsSuccessful()
      .assertMethodCalledWithDataAsExpected(spyingActionCreate.args, this.testOptions.expectedActions);
  });

  test(
    "TriggerHandlerImporter:  should transform triggers as expected",
    async () => {
      const spyingTriggerExtract = this.sinonSandbox.spy(this.testOptions.depsConstructors.triggersHandlersImporter.prototype, "extractTriggers");
      const assert = await this.importerContext.importAndCreateAssert(this.appToImport);
      assert.assertIsSuccessful()
        .assertMethodReturnedWithDataAsExpected(spyingTriggerExtract.returnValues[0], this.testOptions.expectedTriggers);
    }
  );

  test(
    "TriggerHandlerImporter:  should reconcile handlers with new action id",
    async () => {
      const spyingReconcileHandlers = this.sinonSandbox.spy(this.testOptions.depsConstructors.triggersHandlersImporter.prototype, "reconcileTriggersAndActions");
      const assert = await this.importerContext.importAndCreateAssert(this.appToImport);
      assert.assertIsSuccessful()
        .assertMethodReturnedWithDataAsExpected(spyingReconcileHandlers.returnValues[0], this.testOptions.expectedReconciledTriggers);
    }
  );

}
