import isEmpty from 'lodash/isEmpty';

import { AppImporter } from './app-importer';
import { LegacyAppImporterFactory } from './legacy/factory';
import { DeviceAppImporterFactory } from './device/factory';
import { StandardAppImporterFactory } from './standard/factory';
import { getProfileType } from '../../common/utils/profile';
import { FLOGO_PROFILE_TYPES } from '../../common/constants';
import { ErrorManager } from '../../common/errors';
import { IMPORT_ERRORS } from './errors';

export class AppImporterFactory {

  /**
   * @param {ResourceStorageRegistry} resourceStorageRegistry
   */
  constructor(resourceStorageRegistry) {
    this.resourceStorageRegistry = resourceStorageRegistry;
  }

  async create(rawApp) {
    const dependenciesFactory = this.getDependenciesFactory(rawApp);
    if (dependenciesFactory) {
      return this.createAppImporter(await dependenciesFactory.create());
    }
    throw ErrorManager.createCustomValidationError('Could not identify app type to import', IMPORT_ERRORS.CANNOT_IDENTIFY_APP_TYPE, {
      params: {
        knownTypes: [
          { name: 'standard', properties: { type: 'flogo:app', appModel: '1.0.0' } },
          { name: 'device', properties: { type: 'flogo:app:device' } },
          { name: 'legacy', properties: { type: 'flogo:app', appModel: null } },
        ],
      },
    });
  }

  // Since we only have three types of importers as of feb 2018 we're using
  // a simple approach where all the conditions and factories are checked in this class
  // if more types factories are needed then refactoring to a patten where the
  // checks and factories can be dynamically registered
  getDependenciesFactory(rawApp) {
    let dependenciesFactory = null;
    if (this.isStandardApp(rawApp)) {
      dependenciesFactory = this.standardDependenciesFactory();
    } else if (this.isLegacyApp(rawApp)) {
      dependenciesFactory = this.legacyDependenciesFactory();
    } else if (this.isDeviceApp(rawApp)) {
      dependenciesFactory = this.deviceDependenciesFactory();
    }
    return dependenciesFactory;
  }

  isDeviceApp(rawApp) {
    return getProfileType(rawApp) === FLOGO_PROFILE_TYPES.DEVICE;
  }

  deviceDependenciesFactory() {
    return new DeviceAppImporterFactory(this.resourceStorageRegistry);
  }

  isLegacyApp(rawApp) {
    return this.isMicroserviceprofile(rawApp) && isEmpty(rawApp.appModel);
  }

  legacyDependenciesFactory() {
    return new LegacyAppImporterFactory(this.resourceStorageRegistry);
  }

  isStandardApp(rawApp) {
    return this.isMicroserviceprofile(rawApp) && rawApp.appModel === '1.0.0';
  }

  standardDependenciesFactory() {
    return new StandardAppImporterFactory(this.resourceStorageRegistry);
  }

  createAppImporter({ validator, actionsImporter, triggersHandlersImporter }) {
    return new AppImporter(
      validator,
      this.getAppsManager(),
      actionsImporter,
      triggersHandlersImporter,
    );
  }

  isMicroserviceprofile(rawApp) {
    return getProfileType(rawApp) === FLOGO_PROFILE_TYPES.MICRO_SERVICE;
  }

  getAppsManager() {
    return this.resourceStorageRegistry.getAppsManager();
  }

}

