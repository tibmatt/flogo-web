import { Resource } from '@flogo-web/core';
import { ResourceExportContext } from '@flogo-web/server/core';

export type ResourceExporterFn = (
  resource: Resource,
  context: ResourceExportContext
) => Resource;
