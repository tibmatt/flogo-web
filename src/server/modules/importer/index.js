import { AppImporterFactory } from './app-importer-factory';
import { ResourceStorageRegistry } from './resource-storage-registry';

export async function importApp(rawApp) {
  if (!rawApp) {
    // todo: correct error type
    throw new Error('Empty app');
  }
  const importerFactory = new AppImporterFactory(ResourceStorageRegistry);
  const importer = await importerFactory.create(rawApp);
  return importer.import(rawApp);
}
