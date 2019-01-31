import { cloneDeep } from 'lodash';

import { Schemas } from '@flogo-web/server/core';

import { UniqueIdAgent } from './utils/unique-id-agent';

import { validatorFactory } from './validator-factory';

import { Exporter } from './exporter';
import { StandardMicroServiceFormatter } from './formatters/standard-microservice-formatter/standard-microservice-formatter';
import { ActivitiesManager } from '../activities';
import { isValidApplicationType } from '../../common/utils';

export function exportApplication(app, options = {}) {
  return ActivitiesManager.find().then(activitySchemas => {
    let formatter;
    let validator;

    if (!isValidApplicationType(app.type)) {
      throw new Error('Can only export microservice applications');
    }
    formatter = new StandardMicroServiceFormatter(activitySchemas);
    validator = validatorFactory(Schemas.v1.app, {
      schemas: [Schemas.v1.common, Schemas.v1.trigger, Schemas.v1.flow],
      useDefaults: false,
    });

    return executeExport({ app, options, formatter, validator });
  });
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
