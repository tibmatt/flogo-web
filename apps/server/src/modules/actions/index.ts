import { injectable, Container } from 'inversify';
import { pick, omit } from 'lodash';

import { ERROR_TYPES, ErrorManager } from '../../common/errors';
import { Validator } from './validator';

import { HandlersService } from '../apps/handlers-service';
import { generateShortId } from '../../common/utils';
import { findGreatestNameIndex } from '../../common/utils/collection';
import { ResourceRepository } from '../resources/resource.repository';
import { flowifyApp, flowify } from '../resources/transitional-resource.repository';

const EDITABLE_FIELDS_CREATION = [
  'name',
  'description',
  'metadata',
  'tasks',
  'links',
  'errorHandler',
];

const EDITABLE_FIELDS_UPDATE = [
  'name',
  'description',
  'metadata',
  'tasks',
  'links',
  'errorHandler',
];

@injectable()
/**
 * @deprectated will be replaced by ResourceService
 * @See ../resouces/resource-service.ts
 */
export class ActionsManager {
  private static container: Container;

  static setContainer(container: Container) {
    this.container = container;
  }

  private static get repository() {
    // todo: container shouldn't be used this way, we should use @inject annotations to inject the dependencies
    return this.container.resolve(ResourceRepository);
  }

  private static get handlersManager() {
    // todo: container shouldn't be used this way, we should use @inject annotations to inject the dependencies
    return this.container.resolve(HandlersService);
  }

  static async create(appId: string, actionData) {
    const resourceRepository = this.repository;
    if (!appId) {
      return Promise.reject(
        ErrorManager.makeError('Missing app id', {
          type: ERROR_TYPES.COMMON.NOT_FOUND,
        })
      );
    }

    const app = await resourceRepository.getApp(appId);
    if (!app) {
      throw ErrorManager.makeError('App not found', {
        type: ERROR_TYPES.COMMON.NOT_FOUND,
      });
    }

    const errors = Validator.validate(actionData);
    if (errors) {
      throw ErrorManager.createValidationError('Validation error', {
        details: errors,
      });
    }

    actionData.name = ensureUniqueName(app.actions, actionData.name);
    actionData = cleanInput(actionData, EDITABLE_FIELDS_CREATION);
    actionData.id = generateShortId();
    actionData.name = actionData.name.trim();

    const action = await resourceRepository.create(appId, actionData);
    return ActionsManager.findOne(actionData.id).then(flowify);
  }

  static async update(actionId, actionData) {
    const resourceRepository = this.repository;
    const existingAction = await ActionsManager.findOne(actionId).then(flowify);
    if (!existingAction) {
      throw ErrorManager.makeError('Action not found', {
        type: ERROR_TYPES.COMMON.NOT_FOUND,
      });
    }
    const appId = existingAction.appId;
    actionData = cleanInput(actionData, EDITABLE_FIELDS_UPDATE);
    const errors = Validator.validate(Object.assign(existingAction, actionData));
    if (errors) {
      throw ErrorManager.createValidationError('Validation error', errors);
    }
    await resourceRepository.update(appId, { ...actionData, id: actionId });
    return ActionsManager.findOne(actionId).then(flowify);
  }

  static async findOne(actionId) {
    let app = await this.repository.findAppByResourceId(actionId).then(flowifyApp);
    if (!app) {
      return null;
    }
    const action = app.actions.find(t => t.id === actionId);
    action.appId = app._id;

    const triggers = app.triggers.filter(t => {
      const h = t.handlers.filter(a => a.actionId === actionId);
      return h.length > 0;
    });
    app.id = app._id;
    app = omit(app, ['triggers', 'actions', '_id']);

    return Object.assign({}, action, { app, triggers });
  }

  static async list(appId, options) {
    const app = await this.repository.getApp(appId).then(flowifyApp);
    let actions = app && app.actions ? app.actions : [];
    if (options && options.filter && options.filter.by === 'name') {
      const comparableName = options.filter.value.trim().toLowerCase();
      actions = actions.filter(a => comparableName === a.name.trim().toLowerCase());
    } else if (options && options.filter && options.filter.by === 'id') {
      actions = actions.filter(a => options.filter.value.indexOf(a.id) !== -1);
    }
    actions = projectOutputOnFields(actions, options.project);
    return actions;
  }

  static listRecent() {
    return this.repository.listRecent();
  }

  static async remove(actionId) {
    const resourceRepository = this.repository;
    const wasRemoved = await resourceRepository.remove(actionId);
    if (wasRemoved) {
      await this.handlersManager.removeByActionId(actionId);
    }
    return wasRemoved;
  }

  static removeFromRecentByAppId(appId) {
    return this.repository.removeFromRecent('appId', appId);
  }
}

function cleanInput(action, fields) {
  const cleanAction = pick(action, fields);
  if (cleanAction.name) {
    cleanAction.name = cleanAction.name.trim();
  }
  return cleanAction;
}

function ensureUniqueName(actions, name) {
  const greatestIndex = findGreatestNameIndex(name, actions);
  if (greatestIndex >= 0) {
    name = `${name} (${greatestIndex + 1})`;
  }
  return name;
}

function projectOutputOnFields(actionArray, fields) {
  if (fields && fields.length > 0) {
    fields.push('id');
    return actionArray.map(action => pick(action, fields));
  }
  return actionArray;
}
