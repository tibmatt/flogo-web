/** @module importer */
import { AppsManager } from '../apps';
import { ActivitiesManager as ContribActivitiesManager } from '../activities';
import { TriggerManager as ContribTriggersManager } from '../triggers';
import { ActionsManager } from '../actions';
import { AppsTriggersManager } from '../apps/triggers';
import { HandlersManager } from '../apps/handlers';

export class ResourceStorageRegistry {
  static getAppsManager() {
    return AppsManager;
  }

  static getContribTriggersManager() {
    return ContribTriggersManager;
  }

  static getContribActivitiesManager() {
    return ContribActivitiesManager;
  }

  static getActionsManager() {
    return ActionsManager;
  }

  static getAppsTriggersManager() {
    return AppsTriggersManager;
  }

  static getHandlersManager() {
    return HandlersManager;
  }
}
