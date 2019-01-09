import { map, assign, remove } from 'lodash';
import { Injectable } from '@angular/core';

import {
  activitySchemaToTask,
  activitySchemaToTrigger,
  createSubFlowTask,
} from '../models';

import { CONTRIB_REF_PLACEHOLDER, FLOGO_CONTRIB_TYPE } from '../constants';
import { RESTAPIContributionsService } from './restapi';

@Injectable()
export class FlogoProfileService {
  constructor(private contribService: RESTAPIContributionsService) {}

  getTriggers() {
    return this.contribService.listContribs(FLOGO_CONTRIB_TYPE.TRIGGER).then(response => {
      const data = response || [];
      return map(data, (trigger: any) => {
        return assign(activitySchemaToTrigger(trigger), {
          // TODO fix this installed status.
          // as of now, whatever can be read from db, should have been installed.
          installed: true,
        });
      });
    });
  }

  /*****
   * @deprecated
   */
  getActivities() {
    let subflowAcivitySchema;
    return this.contribService
      .listContribs(FLOGO_CONTRIB_TYPE.ACTIVITY)
      .then(response => {
        const data = response || [];
        // Exclude subflow activity from processing it as a normal activity
        subflowAcivitySchema = remove(
          data,
          (activity: any) => activity.ref === CONTRIB_REF_PLACEHOLDER.REF_SUBFLOW
        ).pop();
        return map(data, (activity: any) => {
          return assign(activitySchemaToTask(activity), {
            // TODO fix this installed status.
            // as of now, whatever can be read from db, should have been installed.
            installed: true,
          });
        });
      })
      .then((result: any[]) => {
        // Create a custom activity task object for subflow using suflow schema. Also we need to add it to the list only if
        // the subflow is installed in the flogo-web engine
        if (subflowAcivitySchema) {
          result.unshift(createSubFlowTask(subflowAcivitySchema));
        }
        return result;
      });
  }
}
