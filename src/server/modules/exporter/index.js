import { FLOGO_PROFILE_TYPES } from '../../common/constants';
import { getProfileType } from '../../common/utils/profile';

import * as schemas from '../schemas/v1.0.0';

import { UniqueIdAgent } from './utils/unique-id-agent';
import { fullAppSchema, fullDeviceAppSchema } from '../apps/schemas';

import { validatorFactory } from './validator-factory';
import { LegacyMicroServiceFormatter } from './formatters/legacy-microservice-formatter';
import { DeviceFormatter } from './formatters/device-formatter';

import { Exporter } from './exporter';
import { StandardMicroServiceFormatter } from './formatters/standard-microservice-formatter/standard-microservice-formatter';

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
  if (appProfileType !== FLOGO_PROFILE_TYPES.MICRO_SERVICE) {
    // can't export standard mode of a device app
    throw new Error('Can only export microservice apps to an standard format');
  }
  const formatter = new StandardMicroServiceFormatter();
  const validator = validatorFactory(schemas.app, {
    schemas: [
      schemas.common,
      schemas.trigger,
      schemas.flow,
    ],
    useDefaults: false,
  });
  return executeExport({ app, options, formatter, validator });
}

function executeExport({ app, options, formatter, validator }) {
  const { isFullExportMode = true, onlyThisActions = [] } = options || {};
  const exporter = new Exporter(isFullExportMode, formatter, validator, new UniqueIdAgent());
  return exporter.export(app, onlyThisActions);
}
