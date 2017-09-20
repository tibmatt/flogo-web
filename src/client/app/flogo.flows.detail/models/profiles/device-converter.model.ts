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
