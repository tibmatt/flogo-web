import {ResourceStorageRegistryMock} from './resource-storage-mock';
import {AppImporterFactory} from '../app-importer-factory';
import {makeImporterContext} from './test-utils.spec';
import cloneDeep from 'lodash/cloneDeep';

const app = require('./samples/standard-app');


describe('Importer: Standard', function () {
  let importerFactory;
  before(async function () {
    importerFactory = new AppImporterFactory(ResourceStorageRegistryMock);
    this.importerContext = makeImporterContext(importerFactory);
  });

  it('should import a standard application', async function () {
    const appUnderTest = cloneDeep(app);
    const assert = await this.importerContext.importAndCreateAssert(appUnderTest);
    assert.assertIsSuccessful();
  });

  ['name', 'appModel'].forEach(requiredProp => {
    it(`should import a standard application which require ${requiredProp}`, async function () {
      const appUnderTest = cloneDeep(app);
      delete appUnderTest[requiredProp];
      const assert = await this.importerContext.importAndCreateAssert(appUnderTest);
      assert.assertIsFailed();
    });
  });

  it('should import a standard application which accept only appModel 1.0.0', async function () {
    const appUnderTest = cloneDeep(app);
    appUnderTest.appModel = '1.1.0';
    const assert = await this.importerContext.importAndCreateAssert(appUnderTest);
    assert.assertIsFailed();
  });

  it('should import a standard application which accept valid resource id', async function () {
    const appUnderTest = cloneDeep(app);
    appUnderTest.resources[0].id = 'flowUri';
    const assert = await this.importerContext.importAndCreateAssert(appUnderTest);
    assert.assertIsFailed();
  });

  it('should import a standard application which accept valid flowURI ', async function () {
    const appUnderTest = cloneDeep(app);
    appUnderTest.triggers[0].handlers[0].action.data.flowURI = 'res://flow:get_status';
    const assert = await this.importerContext.importAndCreateAssert(appUnderTest);
    assert.assertIsSuccessful();
  });

  it('should import a standard application which require flowURI for flowdata ', async function () {
    const appUnderTest = cloneDeep(app);
    delete appUnderTest.triggers[0].handlers[0].action.data.flowURI;
    const assert = await this.importerContext.importAndCreateAssert(appUnderTest);
    assert.assertIsFailed();
  });

  ['id', 'data'].forEach(requiredProp => {
    it(`should import a standard application which require resource ${requiredProp}`, async function () {
      const appUnderTest = cloneDeep(app);
      delete appUnderTest.resources[0][requiredProp];
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
    appToImport.resources[0].data.tasks[0].activity.ref = "some.domain/path/to/activity";
    const assert = await this.importerContext.importAndCreateAssert(appToImport);
    assert.assertIsFailed()
      .assertHasFailedWithError('activity-installed', {
        "ref": "some.domain/path/to/activity"
      });
  });

});
