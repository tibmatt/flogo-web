import { Injectable } from '@angular/core';
import { Headers, Http, RequestOptions, Response } from '@angular/http';
import 'rxjs/add/operator/toPromise';
import { environment } from '../../../../../environments/environment';
import { HttpUtilsService } from '../http-utils.service';

export const domainURL = environment.hostname;

@Injectable()
export class RESTAPITriggersService {
  constructor(private http: Http, private httpUtils: HttpUtilsService) {
  }

  createTrigger(appId, trigger: any) {
    const headers = new Headers({ 'Content-Type': 'application/json' });
    const options = new RequestOptions({ headers: headers });

    return this.http.post(this.apiPrefix(`apps/${appId}/triggers`), trigger, options).toPromise()
      .then(response => response.json().data);
  }

  listTriggersApp(appId) {
    return this.http.get(this.apiPrefix(`apps/${appId}/triggers`)).toPromise()
      .then(response => {
        return response.json().data;
      });
  }

  getTrigger(triggerId) {
    return this.http.get(this.apiPrefix(`triggers/${triggerId}`))
      .toPromise()
      .then(response => response.json().data);
  }

  updateTrigger(triggerId: string, trigger: any) {
    const headers = new Headers({ 'Content-Type': 'application/json' });
    const options = new RequestOptions({ headers: headers });

    return this.http.patch(this.apiPrefix(`triggers/${triggerId}`), trigger, options).toPromise()
      .then(response => this.extractData(response))
      .catch(error => Promise.reject(this.extractErrors(error)));
  }

  deleteTrigger(triggerId: string) {
    return this.http.delete(this.apiPrefix(`triggers/${triggerId}`)).toPromise();
  }

  private extractData(res: Response) {
    const body = res.json();
    // todo: body.data won't always be an object, could be an array
    return body ? body.data : {};
  }

  private extractErrors(error: Response | any) {
    if (error instanceof Response) {
      const body = error.json();
      const errs = body.errors || [body];
      return errs;
    } else {
      return new Error('Unknown error');
    }
  }

  private apiPrefix(path) {
    return this.httpUtils.apiPrefix(path, 'v2');
  }


}
