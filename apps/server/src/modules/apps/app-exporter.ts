import { injectable } from 'inversify';

import { ResourcePluginRegistry, ResourceTypes } from '../../extension';
import { exportApp, ExportAppOptions } from '../transfer';
import { AllContribsService } from '../all-contribs';

export { ExportAppOptions };

function resourceExportResolver(resourceTypes: ResourceTypes) {
  return (resourceType: string) => {
    return resourceTypes.isKnownType(resourceType)
      ? resourceTypes.exporter(resourceType)
      : null;
  };
}

@injectable()
export class AppExporter {
  constructor(
    private pluginRegistry: ResourcePluginRegistry,
    private allContribsService: AllContribsService
  ) {}

  async export(app, options?: ExportAppOptions) {
    const contributions = await this.allContribsService.allByRef();
    const resourceTypes = this.pluginRegistry.resourceTypes;
    const resourceRefs = new Map<string, string>(
      resourceTypes.allTypes().map(t => [t.type, t.ref] as [string, string])
    );
    return exportApp(
      app,
      resourceExportResolver(resourceTypes),
      contributions,
      resourceRefs,
      options
    );
  }
}
