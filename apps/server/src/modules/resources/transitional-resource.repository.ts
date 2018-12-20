import { injectable } from 'inversify';
import { pick, omit } from 'lodash';
import { Resource } from '@flogo-web/server/core';
import { Logger } from '../../common/logging';
import { Database } from '../../common/database.service';
import { ResourceRepository } from './resource.repository';
import { App } from '../../interfaces';

const RESOURCE_FIELDS: Array<keyof Resource> = [
  'id',
  'name',
  'type',
  'createdAt',
  'updatedAt',
  'description',
];

/**
 * @deprecated only for transition to resources
 */
export function flowify(resource) {
  let flow: any = resource;
  if (resource.data) {
    flow = { ...resource, ...resource.data };
    delete flow.data;
  }
  return flow;
}

/**
 * @deprecated only for transition to resources
 */
export function unflowify(flow) {
  return {
    ...pick(flow, RESOURCE_FIELDS),
    data: { ...omit(flow, RESOURCE_FIELDS) },
    type: flow.type || 'flow',
  };
}

/**
 * @deprecated only for transition to resources
 */
export function unflowifyApp(app: App) {
  if (app && app.actions) {
    app.actions = app.actions.map(unflowify);
  }
  return app;
}

/**
 * @deprecated only for transition to resources
 */
export function flowifyApp(app: App): any {
  if (app && app.actions) {
    app.actions = app.actions.map(flowify);
  }
  return app;
}

@injectable()
/**
 * Adding this proxy as a bridge between the current state of the db and the new changes for resource plugins
 * TODO: remove once we move to r
 * @deprecated only for transition to resources
 */
export class TransitionalResourceRepository extends ResourceRepository
  implements ResourceRepository {
  constructor(appsDb: Database, indexerDb: Database, logger: Logger) {
    super(appsDb, indexerDb, logger);
  }

  getApp(appId): Promise<App> {
    return super.getApp(appId).then(unflowifyApp);
  }

  create(appId: string, resource: Resource) {
    return super.create(appId, flowify(resource));
  }

  async update(
    appId: string,
    resource: Partial<Resource> & { id: string }
  ): Promise<boolean> {
    return super.update(appId, flowify(resource));
  }

  findAppByResourceId(resourceId: string) {
    return super.findAppByResourceId(resourceId).then(unflowifyApp);
  }
}
