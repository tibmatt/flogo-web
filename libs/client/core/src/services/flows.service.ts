import { Injectable } from '@angular/core';

import {
  TriggersApiService,
  RESTAPIHandlersService as HandlersService,
  APIFlowsService as FlowsApiService,
  RESTAPIContributionsService,
} from './restapi';
import { TriggerSchema } from '../interfaces';

const mapSettingsArrayToObject = (settings: { name: string; value?: any }[]) =>
  (settings || []).reduce((all, c) => ({ ...all, [c.name]: c.value }), {});

@Injectable()
export class FlowsService {
  constructor(
    private handlersService: HandlersService,
    private flowsService: FlowsApiService,
    private triggersService: TriggersApiService,
    private contribTriggerService: RESTAPIContributionsService
  ) {}

  createFlow(
    appId: string,
    newFlow: { name: string; description: string },
    triggerId
  ): Promise<any> {
    if (!triggerId) {
      return this.flowsService.createFlow(appId, newFlow);
    }
    return this.flowsService
      .createFlow(appId, newFlow)
      .then(flow => {
        return this.getContribInfo(triggerId).then(contribTrigger => ({
          flow,
          contribTrigger,
        }));
      })
      .then(({ flow, contribTrigger }) => {
        const handlerSchema = contribTrigger.handler || ({} as TriggerSchema);
        const settings = mapSettingsArrayToObject(handlerSchema.settings);
        const outputs = mapSettingsArrayToObject(contribTrigger.outputs);
        return this.handlersService.updateHandler(triggerId, flow.id, {
          settings,
          outputs,
        });
      });
  }

  deleteFlow(flowId) {
    return this.flowsService.deleteFlow(flowId);
  }

  deleteFlowWithTrigger(flowId: string, triggerId: string) {
    return this.deleteFlow(flowId)
      .then(() => {
        if (triggerId) {
          return this.triggersService.getTrigger(triggerId).then(triggerDetails => {
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
      .catch(err => Promise.reject(err));
  }

  private getContribInfo(triggerInstanceId) {
    return this.triggersService
      .getTrigger(triggerInstanceId)
      .then(triggerInstance =>
        this.contribTriggerService.getContributionDetails<TriggerSchema>(
          triggerInstance.ref
        )
      );
  }
}
