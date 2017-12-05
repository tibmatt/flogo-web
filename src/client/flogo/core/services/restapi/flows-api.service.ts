import { Injectable } from '@angular/core';
import { Headers, Http, RequestOptions, Response, URLSearchParams } from '@angular/http';
import 'rxjs/add/operator/toPromise';
import 'rxjs/add/operator/map';
import { HttpUtilsService } from './http-utils.service';


@Injectable()
export class RESTAPIFlowsService {
  constructor(private http: Http, private httpUtils: HttpUtilsService) {
  }

  createFlow(flowObj: any) {
    const headers = new Headers({ 'Content-Type': 'application/json' });
    const options = new RequestOptions({ headers: headers });
    const body = JSON.stringify(flowObj);

    return this.http.post(this.apiPrefix('flows'), body, options).toPromise();
  }

  getFlows() {
    return this.http.get(this.apiPrefix('flows')).toPromise()
      .then(response => {
        if (response.text()) {
          return response.json();
        } else {
          return response;
        }
      });
  }

  updateFlow(flowObj: Object) {
    const headers = new Headers({ 'Content-Type': 'application/json' });
    const options = new RequestOptions({ headers: headers });
    const body = JSON.stringify(flowObj);

    return this.http.post(this.apiPrefix('flows/update'), body, options).toPromise();
  }

  deleteFlow(flowId) {
    return this.http.delete(this.apiPrefix('flows/' + flowId)).toPromise();
  }

  getFlow(id: string) {
    return this.http.get(this.apiPrefix('flows/' + id)).toPromise()
      .then(response => {
        if (response.text()) {
          return response.json().data;
        } else {
          return response;
        }
      });
  }


  findFlowsByName(flowName: string, options: { appId?: string } = {}) {
    const headers = new Headers({ Accept: 'application/json' });

    const searchParams = new URLSearchParams();
    searchParams.set('name', flowName);
    if (options.appId) {
      searchParams.set('appId', options.appId);
    }

    const requestOptions = new RequestOptions({ headers, search: searchParams });

    return this.http.get(this.apiPrefix(`flows`), requestOptions)
      .map((res: Response) => res.json())
      .toPromise();
  }

  uploadFlow(process: any) {
    //  upload current flow to process service server

    const body = JSON.stringify(process);
    const headers = new Headers(
      {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    );
    const options = new RequestOptions({ headers: headers });

    return this.http.post(this.apiPrefix('flows/run/flows'), body, options)
      .toPromise().then(
        (response: Response) => {
          if (response.text()) {
            return response.json();
          } else {
            // TODO
            //  need to handle the empty response
            //  maybe later on the /flows API should be changed to reply the exist process
            //  instead of an empty response, however, in that case this block won't be run
            return {};
          }
        }
      );
  }

  startFlow(id: string, data: any) {
    const body = JSON.stringify(
      {
        'flowId': id,
        'attrs': data
      }
    );

    const headers = new Headers(
      {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    );

    const options = new RequestOptions({ headers: headers });


    return this.http.post(this.apiPrefix('flows/run/flow/start'), body, options)
      .toPromise()
      .then(
        rsp => {
          if (rsp.text()) {
            return rsp.json();
          } else {
            return rsp;
          }
        }
      );
  }

  importFlow(file: File, appId: string, flowName?: string) {
    const formData: FormData = new FormData();
    formData.append('importFile', file, file.name);

    const searchParams = new URLSearchParams();
    if (flowName) {
      searchParams.set('name', flowName);
    }
    if (appId) {
      searchParams.set('appId', appId);
    }

    const headers = new Headers({ Accept: 'application/json' });
    const requestOptions = new RequestOptions({ headers, search: searchParams });

    return this.http.post(this.apiPrefix('flows/upload'), formData, requestOptions).toPromise()
      .catch(error => Promise.reject(error.json()));
  }

  // restartFlow() TODO need to inject instance related APIs

  private apiPrefix(path) {
    return this.httpUtils.apiPrefix(path, 'v1');
  }
}
