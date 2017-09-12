import {AbstractModelConverter} from '../ui-converter.model';
import {RESTAPIActivitiesService} from '../../../../common/services/restapi/activities-api.service';
import {RESTAPITriggersService} from '../../../../common/services/restapi/triggers-api.service';
import {ErrorService} from '../../../../common/services/error.service';

export class MicroServiceModelConverter extends AbstractModelConverter {
  triggerService: RESTAPITriggersService;
  activityService: RESTAPIActivitiesService;
  constructor(triggerService: RESTAPITriggersService,
              activityService: RESTAPIActivitiesService,
              errorService: ErrorService) {
    super(errorService);
    this.triggerService = triggerService;
    this.activityService = activityService;
  }

  getActivitiesPromise(activities) {
    const promises = [];
    activities.forEach(activityRef => {
      promises.push(this.activityService.getActivityDetails(activityRef));
    });
    return Promise.all(promises);
  }
}
