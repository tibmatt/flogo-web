import { activitiesDBService } from '../../common/db/activities';

import { BaseRegistered } from '../base-registered/index';

import { logger } from '../../common/logging/index';
import { triggersDBService } from '../../common/db/triggers';
import { functionsDBService } from '../../common/db/functions';

/*
 * Server start logic
 *
 * 1. register default activities and triggers.
 * 2. initialise the default engine (the test engine) and build engine.
 * 3. start the test engine.
 * 4. configure the server and start listening
 */

export function syncTasks(engine) {
  const activitiesRegistrator = new BaseRegistered(activitiesDBService);
  const registerActivitiesPromise = activitiesRegistrator
    .clean()
    .then(() => activitiesRegistrator.syncDb(engine.getActivities()))
    .then(() => {
      logger.verbose('registerActivities success');
      return true;
    })
    .catch(err => {
      logger.error('registerActivities error');
      return Promise.reject(err);
    });

  const triggersRegistrator = new BaseRegistered(triggersDBService);
  const registerTriggersPromise = triggersRegistrator
    .clean()
    .then(() => triggersRegistrator.syncDb(engine.getTriggers()))
    .then(() => {
      logger.verbose('registerTriggers success');
      return true;
    })
    .catch(err => {
      logger.error('registerTriggers error');
      return Promise.reject(err);
    });

  const functionsRegistrator = new BaseRegistered(functionsDBService);
  const registerFunctionsPromise = functionsRegistrator
    .clean()
    .then(() => functionsRegistrator.syncDb(engine.getFunctions()))
    .then(() => {
      logger.verbose('registerFunctions success');
      return true;
    })
    .catch(err => {
      logger.error('registerFunctions error');
      return Promise.reject(err);
    });

  return Promise.all([
    registerActivitiesPromise,
    registerTriggersPromise,
    registerFunctionsPromise,
  ]);
}
