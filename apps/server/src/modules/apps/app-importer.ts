import shortid from 'shortid';
import { injectable, inject } from 'inversify';

import { ContributionSchema } from '@flogo-web/core';
import { ResourceHooks } from '@flogo-web/server/core';

import { TOKENS, PluginResolverFn } from '../../core';
import { Database } from '../../common/database.service';
import { ContributionsService } from '../contribs';
import { importApp } from '../transfer';
import { flowifyApp } from '../resources/transitional-resource.repository';
import { saveNew } from './common';

const toPairs = c => [c.ref, c] as [string, any];

async function contribsToPairs(contribPromise: Promise<Array<ContributionSchema>>) {
  const contribs = await contribPromise;
  return contribs.map(toPairs);
}

function resourceImportResolver(resolvePlugin: PluginResolverFn) {
  return (resourceType: string) => {
    const hooks = resolvePlugin(resourceType);
    return hooks ? hooks.onImport.bind(hooks) : null;
  };
}

@injectable()
export class AppImporter {
  constructor(
    @inject(TOKENS.AppsDb)
    private appsDb: Database,
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
    let appToSave = { _id: id, ...newApp };
    // todo: fcastill - adding as transition to resources, remove before v0.9.0
    appToSave = flowifyApp(appToSave as any);
    return saveNew(appToSave, this.appsDb);
  }

  private async loadContribs() {
    const [activities, triggers] = await Promise.all([
      contribsToPairs(this.contribActivitiesService.find()),
      contribsToPairs(this.contribTriggersService.find()),
    ]);
    return new Map<string, ContributionSchema>([...activities, ...triggers]);
  }
}
