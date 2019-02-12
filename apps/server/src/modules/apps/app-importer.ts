import shortid from 'shortid';
import { injectable, inject } from 'inversify';

import { ContributionSchema } from '@flogo-web/core';
import { ResourceHooks } from '@flogo-web/server/core';

import { TOKENS, PluginResolverFn } from '../../core';
import { ContributionsService } from '../contribs';
import { importApp } from '../transfer';
import { contribsToPairs } from './contribs-to-pairs';

function resourceImportResolver(resolvePlugin: PluginResolverFn) {
  return (resourceType: string) => {
    const hooks = resolvePlugin(resourceType);
    return hooks ? hooks.onImport.bind(hooks) : null;
  };
}

@injectable()
export class AppImporter {
  constructor(
    @inject(TOKENS.ResourcePluginFactory)
    private resolvePlugin: (resourceType: string) => ResourceHooks,
    @inject(TOKENS.ContribActivitiesManager)
    private contribActivitiesService: ContributionsService,
    @inject(TOKENS.ContribTriggersManager)
    private contribTriggersService: ContributionsService
  ) {}

  async import(app) {
    const contributions = await this.loadContribs();
    const { id, ...newApp } = await importApp(
      app,
      resourceImportResolver(this.resolvePlugin),
      shortid.generate,
      contributions
    );
    return { _id: id, ...newApp };
  }

  private async loadContribs() {
    const [activities, triggers] = await Promise.all([
      contribsToPairs(this.contribActivitiesService.find()),
      contribsToPairs(this.contribTriggersService.find()),
    ]);
    return new Map<string, ContributionSchema>([...activities, ...triggers]);
  }
}
