import cloneDeep from 'lodash/cloneDeep';

import {EXPORT_MODE, FLOGO_PROFILE_TYPES} from '../../common/constants';
import { getProfileType } from '../../common/utils/profile';

import * as schemas from '../schemas/v1.0.0';

import { UniqueIdAgent } from './utils/unique-id-agent';
import { fullAppSchema, fullDeviceAppSchema } from '../apps/schemas';

import { validatorFactory } from './validator-factory';
import { LegacyMicroServiceFormatter } from './formatters/legacy-microservice-formatter';
import { DeviceFormatter } from './formatters/device-formatter';

import { Exporter } from './exporter';
import { StandardMicroServiceFormatter } from './formatters/standard-microservice-formatter/standard-microservice-formatter';

export function exportApplication(app, appModel, activitySchemas, options = {}) {
  const appProfileType = getProfileType(app);
  let formatter;
  let validator;

  if (appModel === EXPORT_MODE.STANDARD_MODEL && appProfileType !== FLOGO_PROFILE_TYPES.MICRO_SERVICE) {
    // can't export standard mode of a device app
    throw new Error('Can only export microservice apps to an standard format');
  }

  if (appModel === EXPORT_MODE.STANDARD_MODEL) {
    formatter = new StandardMicroServiceFormatter(activitySchemas);
    validator = validatorFactory(schemas.app, {
      schemas: [
        schemas.common,
        schemas.trigger,
        schemas.flow,
      ],
      useDefaults: false,
    });
  } else if (appProfileType === FLOGO_PROFILE_TYPES.DEVICE) {
    formatter = new DeviceFormatter();
    validator = validatorFactory(fullDeviceAppSchema);
  } else {
    formatter = new LegacyMicroServiceFormatter();
    validator = validatorFactory(fullAppSchema);
  }

  return executeExport({ app, options, formatter, validator });
}

function executeExport({ app, options, formatter, validator }) {
  const { isFullExportMode = true, onlyThisActions = [] } = options || {};
  const exporter = new Exporter(isFullExportMode, formatter, validator, new UniqueIdAgent());
  return exporter.export(cloneDeep(app), onlyThisActions);
}
