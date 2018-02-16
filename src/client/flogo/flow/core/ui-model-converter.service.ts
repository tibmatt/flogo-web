import { Injectable } from '@angular/core';
import 'rxjs/add/operator/toPromise';
import { FLOGO_PROFILE_TYPE } from '../../core/constants';
import { RESTAPITriggersService } from '../../core/services/restapi/triggers-api.service';
import { RESTAPIActivitiesService } from '../../core/services/restapi/activities-api.service';
import { ErrorService } from '../../core/services/error.service';
import { RESTAPIContributionsService } from '../../core/services/restapi/v2/contributions.service';
import { FlogoProfileService } from '../../core/services/profile.service';
import { AbstractModelConverter } from './models/ui-converter.model';
import { MicroServiceModelConverter } from './models/profiles/microservice-converter.model';
import { DeviceModelConverter } from './models/profiles/device-converter.model';
import {ActionBase} from '@flogo/core';

@Injectable()
export class UIModelConverterService {
  private converterModelInstance: AbstractModelConverter;

  constructor(public triggerService: RESTAPITriggersService,
              public activityService: RESTAPIActivitiesService,
              public contribService: RESTAPIContributionsService,
              public errorService: ErrorService) {
  }

  setProfile(profile: FLOGO_PROFILE_TYPE) {
    if (profile === FLOGO_PROFILE_TYPE.MICRO_SERVICE) {
      this.converterModelInstance = new MicroServiceModelConverter(this.triggerService, this.activityService, this.errorService);
    } else {
      this.converterModelInstance = new DeviceModelConverter(this.contribService, this.errorService);
    }
  }

  /**
   * Convert Engine Flow Model to UI flow model.
   *
   * @example
   * const uiFlowModel = converterService.runFromRoot({
   *   useFlow: { _id: "flows:flogoweb-admin:2017-02-24T18:21:29.014Z", items: { ... }, paths: {...}  },
   *   attrsData: [{"name":"params", "type":"params", "value":{ "id":3 }}]
   * });
   *
   * runner.state.subscribe(...);
   * runner.completed.subscribe(...);
   *
   * @example
   * try {
   *   const runner = runnerService.getWebFlowModel({
   *    engineFlowObj,
   *    flowTriggerObj
   *   });
   * } catch(error) {
   *    **Error Handling**
   * }
   *
   *
   * @param flowObj - Engine flow model JSON. See mockFlow in ./ui-model-flow.mock.ts
   * @param triggerObj - Engine trigger JSON. see mockTrigger in ./ui-model-trigger.mock.ts
   * @return {Promise<Object>}
   *
   * getWebFlowModel method can throw the following errors:
   *
   * 1. error.type = "ValidationError" -> Will be thrown with Trigger JSON or Flow JSON. When the trigger or activity
   *                                      does not have a 'ref' key for fetching the details of the trigger or activity.
   *
   * 2. error.type = "notInstalledTrigger" -> Will be thrown when the trigger is not installed in the Engine.
   *
   * 3. error.type = "notInstalledActivity" -> Will be thrown when the activity is not installed in the Engine.
   *
   * 4. error.message = "Function linkTiles:Cannot link trigger with first node"
   *                    -> Will be thrown when there is no Link established between trigger and first node.
   *
   * 5. error.message = "Unable to link branches" -> Will be thrown when the link to a branch is not made properly.
   *
   */

  // todo: define interfaces
  getWebFlowModel(flowObj: any, subflowSchemas: Map<string, ActionBase>) {
    return this.converterModelInstance.convertToWebFlowModel(flowObj, subflowSchemas);
  }

  getTriggerTask(trigger) {
    return this.converterModelInstance.getTriggerPromise(trigger)
      .then((installedTrigger) => {
        return this.converterModelInstance.makeTriggerTask(trigger, installedTrigger);
      });
  }

}
