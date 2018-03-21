import {ResourceStorageRegistryMock} from './resource-storage-mock';
import {AppImporterFactory} from '../app-importer-factory';
import {commonTestCases, makeImporterContext} from "./test-utils.spec";
import cloneDeep from "lodash/cloneDeep";

const app = require('./samples/device-app');

function updateTasksRef(app) {
  app.actions[0].data.flow.tasks[0].activityRef = "some.domain/path/to/activity";
  return app;
}

describe('Importer: Device', function () {
  let importerFactory;

  before(async function () {
    this.appToImport = cloneDeep(app);
    importerFactory = new AppImporterFactory(ResourceStorageRegistryMock);
    this.importerContext = makeImporterContext(importerFactory);
  });

  commonTestCases('device', updateTasksRef);

});
