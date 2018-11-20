import { Injectable } from '@angular/core';
import {FLOGO_PROFILE_TYPE, CONTRIB_REF_PLACEHOLDER, FLOGO_CONTRIB_TYPE} from '../constants';
import { RESTAPIContributionsService } from './restapi/v2/contributions.service';
import {activitySchemaToTask, activitySchemaToTrigger, createSubFlowTask} from '../../shared/utils';

@Injectable()
export class FlogoProfileService {

  constructor(private contribService: RESTAPIContributionsService) {}

  getTriggers(profile) {
    return this.contribService.listContribs(profile, FLOGO_CONTRIB_TYPE.TRIGGER).then(response => {
      const data = response || [];
      return _.map(data, (trigger: any) => {
        if (profile === FLOGO_PROFILE_TYPE.DEVICE) {
          trigger.handler = {
            settings: []
          };
        }
        return _.assign(activitySchemaToTrigger(trigger), {
          // TODO fix this installed status.
          // as of now, whatever can be read from db, should have been installed.
          installed: true
        });
      });
    });
  }

  /*****
   * @deprecated
   */
  getActivities(profile) {
    let subflowAcivitySchema;
    return this.contribService.listContribs(profile, FLOGO_CONTRIB_TYPE.ACTIVITY).then(response => {
      const data = response || [];
      // Exclude subflow activity from processing it as a normal activity
      subflowAcivitySchema = _.remove(data, (activity: any) => activity.ref === CONTRIB_REF_PLACEHOLDER.REF_SUBFLOW).pop();
      return _.map(data, (activity: any) => {
        if (profile === FLOGO_PROFILE_TYPE.DEVICE) {
          activity.inputs = activity.settings;
        }
        return _.assign(activitySchemaToTask(activity), {
          // TODO fix this installed status.
          // as of now, whatever can be read from db, should have been installed.
          installed: true
        });
      });
    }).then((result: any[]) => {
      // Create a custom activity task object for subflow using suflow schema. Also we need to add it to the list only if
      // the subflow is installed in the flogo-web engine
      if (profile === FLOGO_PROFILE_TYPE.MICRO_SERVICE && subflowAcivitySchema) {
        result.unshift(createSubFlowTask(subflowAcivitySchema));
      }
      return result;
    });
  }
}
