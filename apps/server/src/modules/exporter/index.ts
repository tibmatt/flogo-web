import { cloneDeep } from 'lodash';
import { ResourceHooks } from '@flogo-web/server/core';

import * as schemas from '../schemas/v1.0.0';

import { UniqueIdAgent } from './utils/unique-id-agent';
import { validatorFactory } from './validator-factory';
import { Exporter } from './exporter';
import { StandardMicroServiceFormatter } from './formatters/standard-microservice-formatter';
import { ActivitiesManager } from '../activities';
import { isValidApplicationType } from '../../common/utils';

export async function exportApplication(app, resourceHooksResolver: (resourceType: string) => ResourceHooks,options = {}) {
  const activitySchemas = await ActivitiesManager.find();
  if (!isValidApplicationType(app.type)) {
    throw new Error('Can only export microservice applications');
  }
  const formatter = new StandardMicroServiceFormatter(activitySchemas, resourceHooksResolver);
  const validator = validatorFactory(schemas.app, {
    schemas: [schemas.common, schemas.trigger, schemas.flow],
    useDefaults: false,
  });
  return executeExport({ app, options, formatter, validator });
}

function executeExport({ app, options, formatter, validator }) {
  const { isFullExportMode = true, onlyThisActions = [] } = options || {};
  const exporter = new Exporter(
    isFullExportMode,
    formatter,
    validator,
    new UniqueIdAgent()
  );
  return exporter.export(cloneDeep(app), onlyThisActions);
}
