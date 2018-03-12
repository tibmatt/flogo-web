import { Observable } from 'rxjs/Observable';
import { Injectable } from '@angular/core';
import { Http, Response, URLSearchParams } from '@angular/http';

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toPromise';
import { HttpUtilsService } from '../http-utils.service';

@Injectable()
export class APIFlowsService {
  constructor(private http: Http, private httpUtils: HttpUtilsService) {
  }

  getFlow(flowId: string) {
    const actionId = flowId;
    return this.http.get(
      this.httpUtils.apiPrefix(`actions/${actionId}`),
      this.httpUtils.defaultOptions()
    )
      .map(response => response.json().data)
      .toPromise();
  }

  createFlow(appId, flow: { name: string, description?: string, version?: string, data?: { flow: any } }) {
    return this.http.post(
      this.httpUtils.apiPrefix(`apps/${appId}/actions`),
      flow,
      this.httpUtils.defaultOptions()
    )
      .map(response => response.json().data)
      .toPromise();
  }

  updateFlow(flowId, flow) {
    const actionId = flowId;
    return this.http.patch(
      this.httpUtils.apiPrefix(`actions/${actionId}`),
      flow,
      this.httpUtils.defaultOptions()
    )
      .map(() => true)
      .toPromise();
  }

  deleteFlow(flowId) {
    const actionId = flowId;
    return this.http.delete(
      this.httpUtils.apiPrefix(`actions/${actionId}`),
      this.httpUtils.defaultOptions()
    )
      .map(() => true)
      .toPromise();
  }

  findFlowsByName(flowName: string, appId: string): Observable<any[]> {
    const searchParams = new URLSearchParams();
    searchParams.set('filter[name]', flowName);
    const reqOptions = this.httpUtils.defaultOptions()
      .merge({
        search: searchParams
      });

    return this.http.get(
      this.httpUtils.apiPrefix(`apps/${appId}/actions`), reqOptions)
      .map((res: Response) => res.json().data);
  }

  getSubFlows(appId: string, flowIds?: string[]) {
    const searchParams = new URLSearchParams();
    searchParams.set('fields', 'id,name,description,metadata,createdAt');
    if (!_.isEmpty(flowIds)) {
      searchParams.set('filter[id]', flowIds.toString());
    }
    const reqOptions = this.httpUtils.defaultOptions()
      .merge({
        search: searchParams
      });

    return this.http.get(
      this.httpUtils.apiPrefix(`apps/${appId}/actions`), reqOptions)
      .map((res: Response) => res.json().data)
      .toPromise();
  }

}
