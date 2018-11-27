import { isEmpty } from 'lodash';
import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { Action } from '@flogo-web/client/core/interfaces';
import { RestApiService } from '../rest-api.service';

@Injectable()
export class APIFlowsService {
  constructor(private restApi: RestApiService) {
  }

  getFlow(flowId: string) {
    return this.restApi
      .get<Action>(`actions/${flowId}`)
      .toPromise();
  }

  createFlow(appId, flow: { name: string, description?: string, version?: string, data?: { flow: any } }) {
    return this.restApi
      .post<Action>(`apps/${appId}/actions`, flow)
      .toPromise();
  }

  updateFlow(flowId, flow): Observable<boolean> {
    const actionId = flowId;
    return this.restApi
      .patch(`actions/${actionId}`, flow)
      .pipe(map(() => true));
  }

  deleteFlow(flowId) {
    const actionId = flowId;
    return this.restApi
      .delete(`actions/${actionId}`)
      .pipe(map(() => true))
      .toPromise();
  }

  findFlowsByName(flowName: string, appId: string): Observable<any[]> {
    return this.restApi
      .get(`apps/${appId}/actions`, { params: { 'filter[name]': flowName } });
  }

  getSubFlows(appId: string, flowIds?: string[]) {
    let params = new HttpParams();
    params = params.set('fields', 'id,name,description,metadata,createdAt');
    if (!isEmpty(flowIds)) {
      params = params.set('filter[id]', flowIds.toString());
    }
    return this.restApi.get<Action[]>(
      `apps/${appId}/actions`, { params })
      .toPromise();
  }

}
