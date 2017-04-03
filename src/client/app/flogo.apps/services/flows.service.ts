import { Injectable } from '@angular/core';

import { RESTAPIHandlersService as HandlersService } from '../../../common/services/restapi/v2/handlers-api.service';
import { APIFlowsService as FlowsApiService } from '../../../common/services/restapi/v2/flows-api.service';
import { RESTAPITriggersService as TriggersService } from '../../../common/services/restapi/v2/triggers-api.service';
import { RESTAPITriggersService as ContribTriggersService } from '../../../common/services/restapi/triggers-api.service';
import { objectFromArray } from '../../../common/utils';

@Injectable()
export class FlowsService {
  constructor(private handlersService: HandlersService,
              private flowsService: FlowsApiService,
              private triggersService: TriggersService,
              private contribTriggerService: ContribTriggersService) {
  }

  createFlow(appId: string, flow: {name: string, description: string}, triggerId) {
    if (!triggerId) {
      return this.flowsService.createFlow(appId, flow);
    }

    return this.flowsService.createFlow(appId, flow)
      .then(flow => this.getContribInfo(triggerId)
        .then(contribTrigger => ({ flow, contribTrigger }))
      )
      .then(({flow, contribTrigger}) => {
        let settings = objectFromArray(contribTrigger.endpoint.settings);
        let outputs = objectFromArray(contribTrigger.outputs);
        return this.handlersService.updateHandler(triggerId, flow.id, { settings, outputs });
      })
  }

  public deleteFlow(flowId) {
    return this.flowsService.deleteFlow(flowId);
  }

  private getContribInfo(triggerInstanceId) {
    return this.triggersService.getTrigger(triggerInstanceId)
      .then(triggerInstance => this.contribTriggerService.getTriggerDetails(triggerInstance.ref))
  }

}
