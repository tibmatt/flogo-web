import {Injectable} from '@angular/core';
import { activitySchemaToTrigger } from '../../../utils';
import { Http, Headers, RequestOptions } from '@angular/http';
import 'rxjs/add/operator/toPromise';

@Injectable()
export class  RESTAPIHandlersService {
  constructor( private http : Http ) {
  }

  updateHandler(triggerId, actionId, trigger) {
    let headers = new Headers({'Content-Type': 'application/json'});
    let options = new RequestOptions({headers: headers});

    return this.http.put(`/api/v2/triggers/${triggerId}/handlers/${actionId}`, trigger, options).toPromise()
      .then(response => response.json().data);

  }

  getHandler(triggerId, actionId) {
    return this.http.get(`/api/v2/triggers/${triggerId}/handlers/${actionId}`).toPromise()
      .then(response => response.json().data);

  }

}
