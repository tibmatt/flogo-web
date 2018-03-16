import {ResourceStorageRegistryMock} from './resource-storage-mock';
import {AppImporterFactory} from '../app-importer-factory';
import {makeImporterContext} from './test-utils.spec';

const app = require('./samples/standard-app');

describe('Importer: Standard', function () {
  let importerFactory;

  before(async function () {
    importerFactory = new AppImporterFactory(ResourceStorageRegistryMock);
    this.importerContext = makeImporterContext(importerFactory);
  });

  it('should import a standard application', async function () {
    const appToImport = {...app};
    const assert = await this.importerContext.importAndCreateAssert(appToImport)
    assert.assertIsSuccessful();
  });
});
