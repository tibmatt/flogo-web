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

  convertToWebFlowModel(flowObj, triggerObj) {
    if (!triggerObj.ref) {
      throw this.errorService.makeOperationalError('Trigger: Wrong input json file', 'Cannot get ref for trigger',
        {
          type: 'ValidationError',
          title: 'Wrong input json file',
          detail: 'Cannot get ref for trigger:',
          property: 'trigger',
          value: triggerObj
        });
    } else {
      const fetchTriggersPromise = triggerObj ? this.triggerService.getTriggerDetails(triggerObj.ref) : [];
      const fetchActivitiesPromise = this.getActivitiesPromise(this.getActivities(flowObj));
      return Promise.all([fetchTriggersPromise, fetchActivitiesPromise])
        .then((triggersAndActivities) => {
          const installedTiles = _.flattenDeep(triggersAndActivities);
          return this.processFlowObj(flowObj, triggerObj, installedTiles);
        });
    }
  }

  getActivitiesPromise(activities) {
    const promises = [];
    activities.forEach(activityRef => {
      promises.push(this.activityService.getActivityDetails(activityRef));
    });
    return Promise.all(promises);
  }
}
