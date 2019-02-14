import { ContainerModule, interfaces } from 'inversify';
import { TOKENS } from '../../core';

import { ResourceService } from '../../modules/resources';
import {
  AppsService,
  AppImporter,
  AppTriggersService,
  HandlersService,
} from '../../modules/apps';
import { TriggerManager } from '../../modules/triggers';
import { ActionsManager } from '../../modules/actions';
import { ActivitiesManager } from '../../modules/activities';

export const ModelsModule = new ContainerModule((bind: interfaces.Bind) => {
  bind(ResourceService).toSelf();
  bind(AppImporter).toSelf();
  bind(AppsService).toSelf();
  bind(AppTriggersService).toSelf();
  bind(HandlersService).toSelf();
  bind(TOKENS.ActionsManager).toConstantValue(ActionsManager);
  bind(TOKENS.ContribActivitiesManager).toConstantValue(ActivitiesManager);
  bind(TOKENS.ContribTriggersManager).toConstantValue(TriggerManager);
});
