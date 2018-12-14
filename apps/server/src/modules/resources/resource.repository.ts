import { inject, injectable } from 'inversify';
import { Resource } from '@flogo-web/server/core';
import { App } from '../../interfaces';
import { TOKENS } from '../../core';
import { ISONow } from '../../common/utils';
import { Database } from '../../common/database.service';
import { Logger } from '../../common/logging';
import { CONSTRAINTS } from '../../common/validation';
import { ErrorManager, ERROR_TYPES } from '../../common/errors';
import { prepareUpdateQuery } from './prepare-update-query';

const RECENT_ACTIONS_ID = 'actions:recent';
const MAX_RECENT = 10;

@injectable()
export class ResourceRepository {
  constructor(
    @inject(TOKENS.AppsDb) private appsDb: Database,
    @inject(TOKENS.ActionIndexerDb) private indexerDb: Database,
    @inject(TOKENS.Logger) private logger: Logger
  ) {}

  getApp(appId): Promise<App> {
    return this.appsDb.findOne({ _id: appId }, { actions: 1 });
  }

  async create(appId: string, resource: Resource): Promise<number> {
    resource.createdAt = ISONow();
    resource.updatedAt = null;
    return this.appsDb.update(
      { _id: appId },
      {
        $push: {
          actions: {
            ...resource,
            createdAt: ISONow(),
            updatedAt: null,
          },
        },
      }
    );
  }

  async update(
    appId: string,
    resource: Partial<Resource> & { id: string }
  ): Promise<boolean> {
    const updateCount = await atomicUpdate(this.appsDb, {
      resource,
      appId,
    });
    if (updateCount <= 0) {
      return Promise.reject(new Error('Error while saving flow'));
    }
    storeAsRecent(this.indexerDb, resource).catch(e => this.logger.error(e));
    return true;
  }

  findAppByResourceId(resourceId: string) {
    return this.appsDb.findOne({ 'actions.id': resourceId });
  }

  listRecent() {
    return this.indexerDb
      .findOne({ _id: RECENT_ACTIONS_ID })
      .then(all => (all && all.actions ? all.actions : []));
  }

  async remove(resourceId: string) {
    const removedCount = await this.appsDb.update(
      { 'actions.id': resourceId },
      { $pull: { actions: { id: resourceId } } }
    );
    const wasDeleted = removedCount > 0;
    if (wasDeleted) {
      this.logIfFailed(removeFromRecent(this.indexerDb, 'id', resourceId));
    }
    return wasDeleted;
  }

  removeFromRecent(compareField: string, fieldVal: any) {
    return removeFromRecent(this.indexerDb, compareField, fieldVal);
  }

  private logIfFailed(promise: Promise<any>) {
    promise.catch(e => this.logger.error(e));
  }
}

function atomicUpdate(appsDb: Database, { resource, appId }) {
  return new Promise((resolve, reject) => {
    const appQuery = { _id: appId };
    const updateQuery = {};

    const createUpdateQuery = (err, app) => {
      if (err) {
        return reject(err);
      } else if (!app) {
        return reject(
          ErrorManager.makeError('App not found', {
            type: ERROR_TYPES.COMMON.NOT_FOUND,
          })
        );
      }

      if (resource.name) {
        const isNameUnique = !(app.resources || []).find(
          resourceNameComparator(resource)
        );
        if (!isNameUnique) {
          // do nothing
          return reject(
            ErrorManager.createValidationError('Validation error', [
              {
                property: 'name',
                title: 'Name already exists',
                detail: "There's another action in the app with this name",
                value: {
                  actionId: resource.id,
                  appId: app.id,
                  name: resource.name,
                },
                type: CONSTRAINTS.UNIQUE,
              },
            ])
          );
        }
      }

      const actionIndex = app.actions.findIndex(t => t.id === resource.id);
      resource.updatedAt = ISONow();
      Object.assign(
        updateQuery,
        prepareUpdateQuery(resource, app.actions[actionIndex], actionIndex)
      );
      return null;
    };

    // queue find and update operation to nedb to make sure they execute one after the other
    // and no other operation is mixed between them
    appsDb.collection.findOne(appQuery, { actions: 1 }, createUpdateQuery);
    appsDb.collection.update(appQuery, updateQuery, {}, (err, updatedCount) =>
      err ? reject(err) : resolve(updatedCount)
    );
  });
}

const comparableName = name => name.trim().toLowerCase();
function resourceNameComparator(resource: Resource) {
  const resourceName = comparableName(resource.name);
  return (r: Resource) => resourceName(r.name) === resourceName && r.id !== resource.id;
}

function storeAsRecent(indexerDb: Database, withAction) {
  const findQuery = { _id: RECENT_ACTIONS_ID };
  const updateQuery = {} as any;

  return new Promise((resolve, reject) => {
    indexerDb.collection.findOne(findQuery, (error, recentActions) => {
      if (error) {
        reject(error);
        return;
      }

      recentActions = recentActions || { actions: [] };
      const oldActions = recentActions.actions;

      const existingActionIndex = oldActions.findIndex(a => a.id === withAction.id);
      if (existingActionIndex > -1) {
        oldActions.splice(existingActionIndex, 1);
      }

      const newRecentActions = [withAction, ...oldActions.slice(0, MAX_RECENT)];

      updateQuery.$set = { actions: newRecentActions };
    });
    indexerDb.collection.update(findQuery, updateQuery, { upsert: true }, error => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
}

function removeFromRecent(indexerDb: Database, compareField, fieldVal) {
  if (!['id', 'appId'].includes(compareField)) {
    throw new TypeError('Field can only be id or appId');
  }

  const findQuery = { _id: RECENT_ACTIONS_ID };
  const updateQuery: any = {};
  if (compareField === 'id') {
    findQuery['actions.id'] = fieldVal;
    updateQuery.$pull = { actions: { id: fieldVal } };
  } else {
    findQuery['actions.appId'] = fieldVal;
    updateQuery.$pull = { actions: { appId: fieldVal } };
  }

  return indexerDb.findOne(findQuery).then(result => {
    if (result) {
      return indexerDb.update(findQuery, updateQuery, {});
    }
    return null;
  });
}
