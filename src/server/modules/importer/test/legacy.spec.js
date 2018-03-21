import {ResourceStorageRegistryMock} from './resource-storage-mock';
import {AppImporterFactory} from '../app-importer-factory';
import {makeImporterContext} from "./test-utils.spec";
import cloneDeep from 'lodash/cloneDeep';

const app = require('./samples/legacy-app');

describe('Importer: Legacy', function () {
  let importerFactory;

  before(async function () {
    importerFactory = new AppImporterFactory(ResourceStorageRegistryMock);
    this.importerContext = makeImporterContext(importerFactory);
  });

  it('should import a legacy application', async function () {
    const appToImport = cloneDeep(app);
    const assert = await this.importerContext.importAndCreateAssert(appToImport);
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
    appToImport.actions[0].data.flow.rootTask.tasks[0].activityRef = "some.domain/path/to/activity";
    const assert = await this.importerContext.importAndCreateAssert(appToImport);
    assert.assertIsFailed()
      .assertHasFailedWithError('activity-installed', {
        "ref": "some.domain/path/to/activity"
      });
  });
});
