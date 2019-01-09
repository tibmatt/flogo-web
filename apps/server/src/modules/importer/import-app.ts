import { isEmpty } from 'lodash';
import { AppImporterFactory } from './app-importer-factory';
import { ErrorManager } from '../../common/errors';
import { IMPORT_ERRORS } from './errors';

export async function importApp(rawApp, importerFactory: AppImporterFactory) {
  if (isEmpty(rawApp)) {
    throw ErrorManager.createCustomValidationError(
      'Cannot import an empty application',
      IMPORT_ERRORS.EMPTY_APP
    );
  }
  const importer = await importerFactory.create(rawApp);
  return importer.import(rawApp);
}
