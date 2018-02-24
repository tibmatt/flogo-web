import { AppsManager } from '../apps/index.v2';

import { AppImporter } from './app-importer';
import { LegacyAppImporterFactory } from './legacy/factory';
import { DeviceAppImporterFactory } from './device/factory';

export class AppImporterFactory {
  static async standardImporter() {
    throw new Error('Not implemented yet');
  }
  static async legacyImporter() {
    return this.create(await LegacyAppImporterFactory.create());
  }
  static async deviceImporter() {
    return this.create(await DeviceAppImporterFactory.create());
  }

  static async create({ validator, actionsImporter, triggersHandlersImporter }) {
    return new AppImporter(validator, AppsManager, actionsImporter, triggersHandlersImporter);
  }

}

