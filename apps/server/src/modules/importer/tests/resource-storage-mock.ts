import { TriggerManagerMock } from './mocks/trigger-mananger-mock';
import { ActivitiesManagerMock } from './mocks/activities-mananger-mock';
import { AppsManagerMock } from './mocks/apps-manager-mock';
import { ActionsManagerMock } from './mocks/actions-manager-mock';
import { AppsTriggersManagerMock } from './mocks/apps-trigger-manager-mock';
import { HandlerManagerMock } from './mocks/handler-manager-mock';

export class ResourceStorageRegistryMock {
  /**
   * @return {AppsManager}
   */
  static getAppsManager() {
    return AppsManagerMock;
  }

  /**
   * @return {TriggerManager}
   */
  static getContribTriggersManager() {
    return TriggerManagerMock;
  }

  /**
   * @return {ActivitiesManager}
   */
  static getContribActivitiesManager() {
    return ActivitiesManagerMock;
  }

  /**
   * @return {ActionsManager}
   */
  static getActionsManager() {
    return ActionsManagerMock;
  }

  /**
   * @return {AppsTriggersManager}
   */
  static getAppsTriggersManager() {
    return AppsTriggersManagerMock;
  }

  /**
   * @return {HandlersManager}
   */
  static getHandlersManager() {
    return HandlerManagerMock;
  }
}
