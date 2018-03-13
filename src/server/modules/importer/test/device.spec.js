import {expect} from 'chai';
import {ResourceStorageRegistryMock} from './resource-storage-mock';
import {AppImporterFactory} from '../app-importer-factory';

const app = require('./samples/device-app');

describe('Importer: Device', function () {
  let importerFactory;

  before(async function () {
    importerFactory = new AppImporterFactory(ResourceStorageRegistryMock);
  });

  it('should import a device profile application', async function () {
    const appToImport = {...app};
    const importer = await importerFactory.create(appToImport);
    const importedApp = await importer.import(appToImport);
    expect(importedApp).to.be.ok;
  });
});
