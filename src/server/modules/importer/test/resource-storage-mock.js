import {TriggerManagerMock} from "./trigger-mananger-mock";
import {ActivitiesManagerMock} from "./activities-mananger-mock";
import {AppsManagerMock} from "./apps-manager-mock";
import {ActionsManagerMock} from "./actions-manager-mock";
import {AppsTriggersManagerMock} from "./apps-trigger-manager-mock";
import {HandlerManagerMock} from "./handler-manager-mock";
import {ContribManagerMock} from "./contrib-mananger-mock";

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
   * @return {ContribsManager}
   */
  static getDeviceContribsManager() {
    return ContribManagerMock;
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
