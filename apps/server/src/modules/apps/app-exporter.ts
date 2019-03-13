import { injectable, inject } from 'inversify';

import { ContributionSchema } from '@flogo-web/core';

import { TOKENS } from '../../core';
import { ResourcePluginRegistry, ResourceTypes } from '../../extension';
import { exportApp, ExportAppOptions } from '../transfer';
import { ContributionsService } from '../contribs';
import { contribsToPairs } from './contribs-to-pairs';

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
    private contribActivitiesService: ContributionsService,
    @inject(TOKENS.ContribFunctionsManager)
    private contribFunctionsService: ContributionsService
  ) {}

  async export(app, options?: ExportAppOptions) {
    const contributions = await this.loadContribs();
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

  private async loadContribs(): Promise<Map<string, ContributionSchema>> {
    const [activities, functions] = await Promise.all([
      contribsToPairs(this.contribActivitiesService.find()),
      contribsToPairs(this.contribFunctionsService.find()),
    ]);
    return new Map<string, ContributionSchema>([...activities, ...functions]);
  }
}
