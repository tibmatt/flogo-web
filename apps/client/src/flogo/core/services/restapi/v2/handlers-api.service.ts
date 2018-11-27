import { Injectable } from '@angular/core';
import { RestApiService } from '../rest-api.service';
import { TriggerHandler } from '@flogo-web/client/flow/core';

@Injectable()
export class RESTAPIHandlersService {
  constructor(private restApiService: RestApiService) {
  }

  updateHandler(triggerId, actionId, handlerSettings) {
    return this.restApiService
      .put<TriggerHandler>(`triggers/${triggerId}/handlers/${actionId}`, handlerSettings)
      .toPromise();
  }

  getHandler(triggerId, actionId) {
    return this.restApiService
      .get(`triggers/${triggerId}/handlers/${actionId}`)
      .toPromise();
  }

  deleteHandler(actionId, triggerId) {
    return this.restApiService
      .delete(`triggers/${triggerId}/handlers/${actionId}`)
      .toPromise();
  }

}
