import { injectable, inject } from 'inversify';

import { ContributionSchema } from '@flogo-web/core';

import { TOKENS } from '../../core';
import { ResourcePluginRegistry, ResourceTypes } from '../../extension';
import { exportApp, ExportAppOptions } from '../transfer';
import { ContributionsService } from '../contribs';

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
    @inject(TOKENS.ContribActivitiesManager)
    private contribActivitiesService: ContributionsService
  ) {}

  async export(app, options?: ExportAppOptions) {
    const contributions = await this.contribActivitiesService.find();
    const contributionMap = new Map<string, ContributionSchema>(
      contributions.map(c => [c.ref, c] as [string, ContributionSchema])
    );
    const resourceTypes = this.pluginRegistry.resourceTypes;
    const resourceRefs = new Map<string, string>(
      resourceTypes.allTypes().map(t => [t.type, t.ref] as [string, string])
    );
    return exportApp(
      app,
      resourceExportResolver(resourceTypes),
      contributionMap,
      resourceRefs,
      options
    );
  }
}
