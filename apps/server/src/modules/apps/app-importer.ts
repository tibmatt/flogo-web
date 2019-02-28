import shortid from 'shortid';
import { injectable, inject } from 'inversify';

import { ContributionSchema } from '@flogo-web/core';

import { TOKENS } from '../../core';
import { ResourceTypes, ResourcePluginRegistry } from '../../extension';
import { ContributionsService } from '../contribs';
import { importApp } from '../transfer';
import { contribsToPairs } from './contribs-to-pairs';

function resourceImportResolver(porting: ResourceTypes) {
  return (resourceType: string) => {
    return porting.isKnownType(resourceType)
      ? porting.importer(resourceType).resource
      : null;
  };
}

@injectable()
export class AppImporter {
  constructor(
    private pluginRegistry: ResourcePluginRegistry,
    @inject(TOKENS.ContribActivitiesManager)
    private contribActivitiesService: ContributionsService,
    @inject(TOKENS.ContribTriggersManager)
    private contribTriggersService: ContributionsService
  ) {}

  async import(app) {
    const contributions = await this.loadContribs();
    const { id, ...newApp } = await importApp(
      app,
      resourceImportResolver(this.pluginRegistry.resourceTypes),
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
