import {ResourceStorageRegistryMock} from './resource-storage-mock';
import {AppImporterFactory} from '../app-importer-factory';
import {commonTestCases, makeImporterContext} from './test-utils.spec';
import cloneDeep from 'lodash/cloneDeep';

const app = require('./samples/standard-app');

function updateTasksRef(app) {
  app.resources[0].data.tasks[0].activity.ref = "some.domain/path/to/activity";
  return app;
}

describe('Importer: Standard', function () {
  let importerFactory;
  before(async function () {
    this.appToImport = cloneDeep(app);
    importerFactory = new AppImporterFactory(ResourceStorageRegistryMock);
    this.importerContext = makeImporterContext(importerFactory);
  });

  commonTestCases('standard', updateTasksRef);

});
