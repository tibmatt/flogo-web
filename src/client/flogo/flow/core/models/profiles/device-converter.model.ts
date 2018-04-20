import { AbstractModelConverter } from '../ui-converter.model';
import {FLOGO_PROFILE_TYPE} from '@flogo/core';

export class DeviceModelConverter extends AbstractModelConverter {

  getProfileType(): FLOGO_PROFILE_TYPE {
    return FLOGO_PROFILE_TYPE.DEVICE;
  }

  getActivitiesSchema(activities) {
    const promises = [];
    activities.forEach(activityRef => {
      promises.push(this.contribService.getContributionDetails(this.getProfileType(), activityRef).then(activity => {
        activity.inputs = activity.settings;
        activity.outputs = [];
        return activity;
      }));
    });
    return Promise.all(promises);
  }

  getFlowInformation(flowJSON) {
    return {
      id: flowJSON.id,
      appId: flowJSON.app.id,
      name: flowJSON.name || flowJSON.id,
      description: flowJSON.description || '',
      app: flowJSON.app
    };
  }
}
