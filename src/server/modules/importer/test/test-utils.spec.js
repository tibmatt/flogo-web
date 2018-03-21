import {expect} from "chai";
import get from "lodash/get";

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

export function commonTestCases(name, updateTask) {
  it(`should import a ${name} application`, async function () {
    const assert = await this.importerContext.importAndCreateAssert(this.appToImport);
    assert.assertIsSuccessful();
  });

  it('should throw error when invalid type of application', async function () {
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

  it('should throw error if application uses a trigger which is not recognised by the server', async function () {
    this.appToImport.triggers[0].ref = "some.domain/path/to/trigger";
    const assert = await this.importerContext.importAndCreateAssert(this.appToImport);
    assert.assertIsFailed()
      .assertHasFailedWithError('trigger-installed', {
        "ref": "some.domain/path/to/trigger"
      });
  });

  it('should throw error if application uses an activity which is not recognised by the server', async function () {
    this.appToImport = updateTask(this.appToImport);
    const assert = await this.importerContext.importAndCreateAssert(this.appToImport);
    assert.assertIsFailed()
      .assertHasFailedWithError('activity-installed', {
        "ref": "some.domain/path/to/activity"
      });
  });
}
