import isEmpty from 'lodash/isEmpty';
import { AppImporterFactory } from './app-importer-factory';
import { ErrorManager } from '../../common/errors';
import { IMPORT_ERRORS } from './errors';

export async function importApp(rawApp, resourceStorageRegistry) {
  if (isEmpty(rawApp)) {
    throw ErrorManager.createCustomValidationError(
      'Cannot import an empty application',
      IMPORT_ERRORS.EMPTY_APP
    );
  }
  const importerFactory = new AppImporterFactory(resourceStorageRegistry);
  const importer = await importerFactory.create(rawApp);
  return importer.import(rawApp);
}

export * from './errors';
