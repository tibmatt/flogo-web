import {Injectable} from '@angular/core';
import { activitySchemaToTrigger } from '../../../utils';
import { Http, Headers, RequestOptions, Response } from '@angular/http';
import 'rxjs/add/operator/toPromise';

@Injectable()
export class  RESTAPITriggersService {
  constructor( private http : Http ) {
  }

  createTrigger(appId, trigger: any) {
    let headers = new Headers({'Content-Type': 'application/json'});
    let options = new RequestOptions({headers: headers});

    return this.http.post(`/api/v2/apps/${appId}/triggers`, trigger, options).toPromise()
      .then(response => response.json().data);
  }

  listTriggersApp(appId) {
    return this.http.get(`/api/v2/apps/${appId}/triggers`).toPromise()
      .then(response => {
        return response.json().data;
      });
  }

  getTrigger(triggerId) {
    return this.http.get(`/api/v2/triggers/${triggerId}`)
      .toPromise()
      .then(response => response.json().data);
  }

  updateTrigger(triggerId: string, trigger: any) {
    let headers = new Headers({ 'Content-Type': 'application/json' });
    let options = new RequestOptions({headers: headers});

    return this.http.patch(`/api/v2/triggers/${triggerId}`, trigger, options).toPromise()
      .then(response => this.extractData(response))
      .catch(error => Promise.reject(this.extractErrors(error)));
  }

  private extractData(res: Response) {
    let body = res.json();
    // todo: body.data won't always be an object, could be an array
    return body ? body.data : {};
  }

  private extractErrors (error: Response | any) {
    if (error instanceof Response) {
      const body = error.json();
      const errs = body.errors || [body];
      return errs;
    } else {
      return new Error('Unknown error');
    }
  }




  }
