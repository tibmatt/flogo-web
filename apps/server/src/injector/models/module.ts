import { ContainerModule, interfaces } from 'inversify';
import { TOKENS } from '../../core';

import { ResourceService } from '../../modules/resources';
import {
  AppsService,
  AppImporter,
  AppExporter,
  AppTriggersService,
  HandlersService,
} from '../../modules/apps';
import { TriggerManager } from '../../modules/triggers';
import { ActivitiesManager } from '../../modules/activities';
import { FunctionManager } from '../../modules/functions';

export const ModelsModule = new ContainerModule((bind: interfaces.Bind) => {
  bind(ResourceService).toSelf();
  bind(AppImporter).toSelf();
  bind(AppExporter).toSelf();
  bind(AppsService).toSelf();
  bind(AppTriggersService).toSelf();
  bind(HandlersService).toSelf();
  bind(TOKENS.ContribActivitiesManager).toConstantValue(ActivitiesManager);
  bind(TOKENS.ContribTriggersManager).toConstantValue(TriggerManager);
  bind(TOKENS.ContribFunctionsManager).toConstantValue(FunctionManager);
});
