import { AppsManager } from '../apps';
import { ActivitiesManager as ContribActivitiesManager } from '../activities';
import { TriggerManager as ContribTriggersManager } from '../triggers';
import { ActionsManager } from '../actions';
import { AppsTriggersManager } from '../apps/triggers';
import { HandlersManager } from '../apps/handlers';
import { HandlersService } from '../apps/handlers-service';
import { ContributionsService } from '../contribs';

export class ResourceStorageRegistry {
  getAppsManager() {
    return AppsManager;
  }

  getContribTriggersManager(): ContributionsService {
    return ContribTriggersManager;
  }

  getContribActivitiesManager(): ContributionsService {
    return ContribActivitiesManager;
  }

  getActionsManager(): ActionsManager {
    return ActionsManager;
  }

  getAppsTriggersManager(): AppsTriggersManager {
    return AppsTriggersManager;
  }

  getHandlersManager(): HandlersService {
    return HandlersManager;
  }
}
