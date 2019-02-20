import { Injectable } from '@angular/core';

import {
  TriggersApiService,
  RESTAPIHandlersService as HandlersService,
  ResourceService,
  RESTAPIContributionsService,
} from './restapi';
import { TriggerSchema } from '../interfaces';
import { Resource } from '@flogo-web/core';

const mapSettingsArrayToObject = (settings: { name: string; value?: any }[]) =>
  (settings || []).reduce((all, c) => ({ ...all, [c.name]: c.value }), {});

@Injectable()
export class AppResourceService {
  constructor(
    private handlersService: HandlersService,
    private resourceService: ResourceService,
    private triggersService: TriggersApiService,
    private contribTriggerService: RESTAPIContributionsService
  ) {}

  createResource(
    appId: string,
    newResource: { name: string; type: string; description?: string },
    triggerId
  ): Promise<{ resource: Resource; handler?: any }> {
    const createResource = () =>
      this.resourceService.createResource(appId, newResource).toPromise();
    if (!triggerId) {
      return createResource().then(resource => ({ resource }));
    }
    return createResource()
      .then(resource => {
        return this.getContribInfo(triggerId).then(contribTrigger => ({
          resource,
          contribTrigger,
        }));
      })
      .then(({ resource, contribTrigger }) => {
        const handlerSchema = contribTrigger.handler || ({} as TriggerSchema);
        const settings = mapSettingsArrayToObject(handlerSchema.settings);
        const outputs = mapSettingsArrayToObject(contribTrigger.outputs);
        return this.handlersService
          .updateHandler(triggerId, resource.id, {
            settings,
            outputs,
          })
          .then(handler => ({
            resource,
            handler,
          }));
      });
  }

  deleteFlow(flowId) {
    return this.resourceService.deleteResource(flowId);
  }

  deleteFlowWithTrigger(flowId: string, triggerId: string) {
    return this.deleteFlow(flowId)
      .toPromise()
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
