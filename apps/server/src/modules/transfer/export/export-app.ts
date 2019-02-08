import { cloneDeep } from 'lodash';
import { ContributionSchema, Resource } from '@flogo-web/core';
import { Schemas, ResourceExportContext } from '@flogo-web/server/core';

import { isValidApplicationType } from '../../../common/utils';
import { StandardMicroServiceFormatter } from './formatters/standard-microservice-formatter';
import { validatorFactory } from './validator-factory';
import { Exporter } from './exporter';
import { UniqueIdAgent } from './utils/unique-id-agent';
import { App } from '../../../interfaces';

export type ResourceExporterFn = (
  resource: Resource,
  context: ResourceExportContext
) => Resource | Promise<Resource>;

export interface ExportAppOptions {
  isFullExportMode?: boolean;
  onlyThisActions?: string[];
}

export function exportApplication(
  app: App,
  resolveExporterFn: (resourceType: string) => ResourceExporterFn,
  activitySchemas: ContributionSchema[],
  options: ExportAppOptions = {}
) {
  if (!isValidApplicationType(app.type)) {
    throw new Error('Can only export microservice applications');
  }
  const formatter = new StandardMicroServiceFormatter(activitySchemas);
  const validator = validatorFactory(Schemas.v1.app, {
    schemas: [Schemas.v1.common, Schemas.v1.trigger, Schemas.v1.flow],
    useDefaults: false,
  });
  const { isFullExportMode = true, onlyThisActions = [] } = options;
  const exporter = new Exporter(
    isFullExportMode,
    formatter,
    validator,
    new UniqueIdAgent()
  );
  return exporter.export(cloneDeep(app), onlyThisActions);
}
