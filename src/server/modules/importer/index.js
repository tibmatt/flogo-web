import { AppImporterFactory } from './app-importer-factory';
import { ResourceStorageRegistry } from './resource-storage-registry';
import { ErrorManager } from '../../common/errors';
import isEmpty from 'lodash/isEmpty';

export async function importApp(rawApp) {
  if (isEmpty(rawApp)) {
    throw ErrorManager.createCustomValidationError('Cannot import an empty application');
  }
  const importerFactory = new AppImporterFactory(ResourceStorageRegistry);
  const importer = await importerFactory.create(rawApp);
  return importer.import(rawApp);
}
