import { AppImporterFactory } from '../app-importer-factory';
import { AppImporterTestContext } from './test-utils';
import { TestOptions } from './test-options';

export interface TestContext {
  importerFactory?: AppImporterFactory;
  importerContext?: AppImporterTestContext;
  testOptions?: TestOptions;
  appToImport?: any;
  sinonSandbox?: any;
}
