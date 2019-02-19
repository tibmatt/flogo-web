import { injectable, inject } from 'inversify';

import { exportApp, ExportAppOptions } from '../transfer';
import { TOKENS, PluginResolverFn } from '../../core';
import { ContributionsService } from '../contribs';
import { ContributionSchema } from '@flogo-web/core';

export { ExportAppOptions };

function resourceExportResolver(resolvePlugin: PluginResolverFn) {
  return (resourceType: string) => {
    const hooks = resolvePlugin(resourceType);
    return hooks ? hooks.beforeExport.bind(hooks) : null;
  };
}

@injectable()
export class AppExporter {
  constructor(
    @inject(TOKENS.ResourcePluginFactory)
    private resolvePlugin: PluginResolverFn,
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
      resourceExportResolver(this.resolvePlugin),
      contributionMap,
      options
    );
  }
}
