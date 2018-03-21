import {ResourceStorageRegistryMock} from './resource-storage-mock';
import {AppImporterFactory} from '../app-importer-factory';
import {makeImporterContext} from "./test-utils.spec";
import cloneDeep from "lodash/cloneDeep";

const app = require('./samples/device-app');

describe('Importer: Device', function () {
  let importerFactory;

  before(async function () {
    importerFactory = new AppImporterFactory(ResourceStorageRegistryMock);
    this.importerContext = makeImporterContext(importerFactory);
  });

  it('should import a device profile application', async function () {
    const appUnderTest = cloneDeep(app);
    const assert = await this.importerContext.importAndCreateAssert(appUnderTest);
    assert.assertIsSuccessful();
  });

  ['name', 'version', 'device'].forEach(requiredProp => {
    it(`should import a device application which require ${requiredProp}`, async function () {
      const appUnderTest = cloneDeep(app);
      delete appUnderTest[requiredProp];
      const assert = await this.importerContext.importAndCreateAssert(appUnderTest);
      assert.assertIsFailed();
    });
  });

  /*
    ['type', 'actions', 'triggers'].forEach(requiredProp => {
      it(`should import a device application which require ${requiredProp}`, async function () {
        const appUnderTest = cloneDeep(app);
        delete appUnderTest[requiredProp];
        const assert = await this.importerContext.importAndCreateAssert(appUnderTest);
        assert.assertIsFailed();
      });
    });
  */

  it('should import a device profile application which require device profile', async function () {
    const appUnderTest = cloneDeep(app);
    delete appUnderTest.device.profile;
    const assert = await this.importerContext.importAndCreateAssert(appUnderTest);
    assert.assertIsFailed();
  });

  ['id', 'ref', 'actionId', 'settings'].forEach(requiredProp => {
    it(`should import a device application with trigger which require ${requiredProp}`, async function () {
      const appUnderTest = cloneDeep(app);
      delete appUnderTest.triggers[0][requiredProp];
      const assert = await this.importerContext.importAndCreateAssert(appUnderTest);
      assert.assertIsFailed();
    });
  });
  ['id', 'ref', 'data'].forEach(requiredProp => {
    it(`should import a device application with actions which require ${requiredProp}`, async function () {
      const appUnderTest = cloneDeep(app);
      delete appUnderTest.actions[0][requiredProp];
      const assert = await this.importerContext.importAndCreateAssert(appUnderTest);
      assert.assertIsFailed();
    });
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
    const appToImport = cloneDeep(app);
    appToImport.triggers[0].ref = "some.domain/path/to/trigger";
    const assert = await this.importerContext.importAndCreateAssert(appToImport);
    assert.assertIsFailed()
      .assertHasFailedWithError('trigger-installed', {
        "ref": "some.domain/path/to/trigger"
      });
  });

  it('should throw error if application uses an activity which is not recognised by the server', async function () {
    const appToImport = cloneDeep(app);
    appToImport.actions[0].data.flow.tasks[0].activityRef = "some.domain/path/to/activity";
    const assert = await this.importerContext.importAndCreateAssert(appToImport);
    assert.assertIsFailed()
      .assertHasFailedWithError('activity-installed', {
        "ref": "some.domain/path/to/activity"
      });
  });
});
