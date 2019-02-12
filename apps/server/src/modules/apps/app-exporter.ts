import { injectable, inject } from 'inversify';

import { ResourceHooks } from '@flogo-web/server/core';

import { exportApplication, ExportAppOptions } from '../transfer';
import { TOKENS } from '../../core';
import { ContributionsService } from '../contribs';
import { ContributionSchema } from '@flogo-web/core';

export { ExportAppOptions };

type PluginResolver = (resourceType: string) => ResourceHooks;
function resourceExportResolver(resolvePlugin: PluginResolver) {
  return (resourceType: string) => {
    const hooks = resolvePlugin(resourceType);
    return hooks ? hooks.beforeExport.bind(hooks) : null;
  };
}

@injectable()
export class AppExporter {
  constructor(
    @inject(TOKENS.ResourcePluginFactory)
    private resolvePlugin: (resourceType: string) => ResourceHooks,
    @inject(TOKENS.ContribActivitiesManager)
    private contribActivitiesService: ContributionsService
  ) {}

  async export(app, options?: ExportAppOptions) {
    const contributions = await this.contribActivitiesService.find();
    const contributionMap = new Map<string, ContributionSchema>(
      contributions.map(c => [c.ref, c] as [string, ContributionSchema])
    );
    return exportApplication(
      app,
      resourceExportResolver(this.resolvePlugin),
      contributionMap,
      options
    );
  }
}
