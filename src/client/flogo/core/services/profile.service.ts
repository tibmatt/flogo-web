import { Injectable } from '@angular/core';
import { FLOGO_PROFILE_TYPE, CONTRIB_REF_PLACEHOLDER } from '../constants';
import { RESTAPIContributionsService } from './restapi/v2/contributions.service';
import {activitySchemaToTask, activitySchemaToTrigger, createSubFlowTask, getProfileType} from '../../shared/utils';
import { AbstractTaskIdGenerator } from './profiles/profiles.utils.service';
import { FlogoDeviceTaskIdGeneratorService } from './profiles/devices/utils.service';
import { FlogoMicroserviceTaskIdGeneratorService } from './profiles/microservices/utils.service';

@Injectable()
export class FlogoProfileService {

  public currentApplicationProfile: FLOGO_PROFILE_TYPE;
  utils: AbstractTaskIdGenerator;

  constructor(private contribService: RESTAPIContributionsService) {

  }

  initializeProfile(app) {
    this.currentApplicationProfile = getProfileType(app);
    if (this.currentApplicationProfile === FLOGO_PROFILE_TYPE.DEVICE) {
      this.utils = new FlogoDeviceTaskIdGeneratorService();
    } else if (this.currentApplicationProfile === FLOGO_PROFILE_TYPE.MICRO_SERVICE) {
      this.utils = new FlogoMicroserviceTaskIdGeneratorService();
    }
  }

  generateTaskID(items?: any, taskSchema?: any) {
    return this.utils.generateTaskID(items, taskSchema);
  }

  getTriggers(profile) {
    return this.contribService.listContribs(profile, 'trigger').then(response => {
      if (response.text()) {
        const data = response.json().data || [];
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
      } else {
        return response;
      }
    });
  }

  getActivities(profile) {
    let subflowAcivitySchema;
    return this.contribService.listContribs(profile, 'activity').then(response => {
      if (response.text()) {
        const data = response.json().data || [];
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
      } else {
        return response;
      }
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
