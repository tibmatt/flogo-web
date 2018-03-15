import { Injectable } from '@angular/core';
import { objectFromArray } from '../../shared/utils';

import { TriggersApiService } from './restapi';
import { RESTAPIHandlersService as HandlersService } from './restapi/v2/handlers-api.service';
import { APIFlowsService as FlowsApiService } from './restapi/v2/flows-api.service';
import { RESTAPITriggersService as ContribTriggersService } from './restapi/triggers-api.service';

@Injectable()
export class FlowsService {
  constructor(private handlersService: HandlersService,
              private flowsService: FlowsApiService,
              private triggersService: TriggersApiService,
              private contribTriggerService: ContribTriggersService) {
  }

  createFlow(appId: string, newFlow: { name: string, description: string }, triggerId) {
    if (!triggerId) {
      return this.flowsService.createFlow(appId, newFlow);
    }

    return this.flowsService.createFlow(appId, newFlow)
      .then(flow => {
        return this.getContribInfo(triggerId)
          .then(contribTrigger => ({ flow, contribTrigger }));
      })
      .then(({ flow, contribTrigger }) => {
        const settings = objectFromArray(contribTrigger.endpoint.settings);
        const outputs = objectFromArray(contribTrigger.outputs);
        return this.handlersService.updateHandler(triggerId, flow.id, { settings, outputs });
      });
  }

  deleteFlow(flowId) {
    return this.flowsService.deleteFlow(flowId);
  }

  deleteFlowWithTrigger(flowId: string, triggerId: string) {
    return this.deleteFlow(flowId)
      .then(() => {
        if (triggerId) {
          return this.triggersService.getTrigger(triggerId)
            .then(triggerDetails => {
              if (triggerDetails.handlers.length === 0) {
                return this.triggersService.deleteTrigger(triggerDetails.id);
              } else {
                return {};
              }
            });
        } else {
          return {};
        }
      })
      .catch((err) => Promise.reject(err));
  }

  private getContribInfo(triggerInstanceId) {
    return this.triggersService.getTrigger(triggerInstanceId)
      .then(triggerInstance => this.contribTriggerService.getTriggerDetails(triggerInstance.ref));
  }

}
