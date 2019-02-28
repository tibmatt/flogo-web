import { injectable, inject } from 'inversify';

import { ContributionSchema } from '@flogo-web/core';

import { TOKENS } from '../../core';
import { PluginRegistry, ResourcePorting } from '../../extension';
import { exportApp, ExportAppOptions } from '../transfer';
import { ContributionsService } from '../contribs';

export { ExportAppOptions };

function resourceExportResolver(porting: ResourcePorting) {
  return (resourceType: string) => {
    return porting.isKnownType(resourceType)
      ? porting.exporter(resourceType).resource
      : null;
  };
}

@injectable()
export class AppExporter {
  constructor(
    private pluginRegistry: PluginRegistry,
    @inject(TOKENS.ContribActivitiesManager)
    private contribActivitiesService: ContributionsService
  ) {}

  async export(app, options?: ExportAppOptions) {
    const contributions = await this.contribActivitiesService.find();
    const contributionMap = new Map<string, ContributionSchema>(
      contributions.map(c => [c.ref, c] as [string, ContributionSchema])
    );
    return exportApp(
      app,
      resourceExportResolver(this.pluginRegistry.porting),
      contributionMap,
      options
    );
  }
}
