import { Injectable } from '@angular/core';
import { Headers, Http, RequestOptions } from '@angular/http';
import 'rxjs/add/operator/toPromise';
import { HttpUtilsService } from './http-utils.service';

@Injectable()
export class RESTAPIActivitiesService {
  constructor(private _http: Http, private httpUtils: HttpUtilsService) {
  }

  getActivityDetails(activityRefUrl: string) {
    return this._http.get(this.apiPrefix('activities?filter[ref]=' + activityRefUrl)).toPromise()
      .then(response => response.json().data[0]);
  }

  getActivities() {
    return this._http.get(this.apiPrefix('activities')).toPromise();
  }

  /**
   * Used to install activities to the local engine.
   * @param {string[]} urls of the activities which are to be installed to the local engine
   * @returns {Promise<Response>}
   * @deprecated since v0.5.4 after migrating the install API to v2
   */
  installActivities(urls: string[]) {

    const body = JSON.stringify({
      'urls': urls
    });

    const headers = new Headers({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });

    const options = new RequestOptions({ headers: headers });

    return this._http.post(this.apiPrefix('activities'), body, options)
      .toPromise()
      .then(rsp => {
        if (rsp.text()) {
          return rsp.json();
        } else {
          return rsp;
        }
      });
  }

  private apiPrefix(path) {
    return this.httpUtils.apiPrefix(path, 'v1');
  }
}
