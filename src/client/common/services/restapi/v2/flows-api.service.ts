import {Injectable} from '@angular/core';
import { Http, URLSearchParams, Response } from '@angular/http';

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toPromise';
import { HttpUtilsService } from '../http-utils.service';

@Injectable()
export class APIFlowsService {
  constructor(private http: Http, private httpUtils: HttpUtilsService){
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

  createFlow(appId, flow: {name:string, description?:string, version?: string, data?: { flow: any }}) {
    return this.http.post(
      this.httpUtils.apiPrefix(`apps/${appId}/actions`),
      flow,
      this.httpUtils.defaultOptions()
    )
      .map(response => response.json().data)
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

  findFlowsByName(flowName: string, appId: string) {
    const searchParams = new URLSearchParams();
    searchParams.set('filter[name]', flowName);
    let reqOptions = this.httpUtils.defaultOptions()
      .merge({
        search: searchParams
      });

    return this.http.get(
      this.httpUtils.apiPrefix(`apps/${appId}/actions`), reqOptions)
      .map((res: Response) => res.json().data)
      .toPromise();
  }

}
