import {AbstractModelConverter} from '../ui-converter.model';
import {RESTAPIContributionsService} from '../../../../common/services/restapi/v2/contributions.service';
import {ErrorService} from '../../../../common/services/error.service';

export class DeviceModelConverter extends AbstractModelConverter {
  contribService: RESTAPIContributionsService;
  constructor(contribService: RESTAPIContributionsService,
              errorService: ErrorService) {
    super(errorService);
    this.contribService = contribService;
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
      const fetchTriggersPromise = triggerObj ? this.contribService.getContributionDetails(triggerObj.ref)
        .then(trigger => {
          trigger.handler = {
            settings: []
          };
          trigger.endpoint = {
            settings: []
          };
          return trigger;
        }) : [];
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
      promises.push(this.contribService.getContributionDetails(activityRef).then(activity => {
        activity.inputs = activity.settings;
        activity.outputs = [];
        return activity;
      }));
    });
    return Promise.all(promises);
  }
}
