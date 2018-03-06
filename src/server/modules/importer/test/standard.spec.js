import { expect } from 'chai';
import { ResourceStorageRegistryMock } from './resource-storage-mock';
import { AppImporterFactory } from '../app-importer-factory';

describe('importer: Standard', function () {
  let storageRegistryMock;
  let importerFactory;

  before(async function () {
    storageRegistryMock = new ResourceStorageRegistryMock();
    importerFactory = new AppImporterFactory(storageRegistryMock);
  });

  xit('works', async function () {
    const appToImport = {};
    const importer = await importerFactory.create(appToImport);
    const importedApp = await importer.import(appToImport);
    expect(importedApp).to.be.ok;
  });
});
