import isEmpty from 'lodash/isEmpty';

import { FLOGO_PROFILE_TYPES } from '../../common/constants';
import { getProfileType } from '../../common/utils/profile';
import { AppImporterFactory } from './app-importer-factory';

export async function importApp(rawApp) {
  if (!rawApp) {
    // throw error
    return null;
  }
  const importer = await getImporter(rawApp);
  return importer.import(rawApp);
}

async function getImporter(rawApp) {
  if (isStandardApp(rawApp)) {
    return AppImporterFactory.standardImporter();
  } else if (isLegacyApp(rawApp)) {
    return AppImporterFactory.legacyImporter();
  } else if (isDeviceApp(rawApp)) {
    return AppImporterFactory.deviceImporter();
  }
  // todo: throw correct error
  throw new Error();
}

function isDeviceApp(rawApp) {
  return getProfileType(rawApp) === FLOGO_PROFILE_TYPES.DEVICE;
}

function isLegacyApp(rawApp) {
  return isMicroserviceprofile(rawApp) && isEmpty(rawApp.appModel);
}

function isStandardApp(rawApp) {
  return isMicroserviceprofile(rawApp) && rawApp.appModel === '1.0.0';
}

function isMicroserviceprofile(rawApp) {
  return getProfileType(rawApp) === FLOGO_PROFILE_TYPES.MICRO_SERVICE;
}
