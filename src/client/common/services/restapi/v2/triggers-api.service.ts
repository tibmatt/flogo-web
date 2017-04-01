import {Injectable} from '@angular/core';
import { activitySchemaToTrigger } from '../../../utils';
import { Http, Headers, RequestOptions } from '@angular/http';
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

}
