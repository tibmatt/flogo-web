import { FLOGO_PROFILE_TYPES } from '../../common/constants';

import { getProfileType } from '../../common/utils/profile';

import { UniqueIdAgent } from './utils/unique-id-agent';
import { fullAppSchema, fullDeviceAppSchema } from '../apps/schemas';

import { validatorFactory } from './validator-factory';
import { LegacyMicroServiceFormatter } from './formatters/legacy-microservice-formatter';
import { DeviceFormatter } from './formatters/device-formatter';

import { Exporter } from './exporter';

export function exportLegacy(app, options = {}) {
  const appProfileType = getProfileType(app);
  let formatter;
  let validationSchema;
  if (appProfileType === FLOGO_PROFILE_TYPES.DEVICE) {
    validationSchema = fullDeviceAppSchema;
    formatter = new DeviceFormatter();
  } else {
    validationSchema = fullAppSchema;
    formatter = new LegacyMicroServiceFormatter();
  }
  const validator = validatorFactory(validationSchema);
  return executeExport({ app, options, formatter, validator });
}

export function exportStandard(app, options) {
  const appProfileType = getProfileType(app);
  let formatter;
  let validator;
  if (appProfileType === FLOGO_PROFILE_TYPES.DEVICE) {
    // can't export standard mode of a device app
    throw new Error('Cannot export a device app to an standard format');
  } else {
    throw new Error('Export app in standard mode: Not implemented yet');
  }
  return executeExport({ app, options, formatter, validator });
}

function executeExport({ app, options, formatter, validator }) {
  const { isFullExportMode = true, onlyThisActions = [] } = options || {};
  const exporter = new Exporter(isFullExportMode, formatter, validator, new UniqueIdAgent());
  return exporter.export(app, onlyThisActions);
}
