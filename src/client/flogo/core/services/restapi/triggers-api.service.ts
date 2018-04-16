import { Injectable } from '@angular/core';
import { Headers, Http, RequestOptions } from '@angular/http';
import 'rxjs/add/operator/toPromise';
import { HttpUtilsService } from './http-utils.service';

@Injectable()
export class RESTAPITriggersService {
  constructor(private _http: Http, private httpUtils: HttpUtilsService) {
  }

  getTriggerDetails(triggerWhereUrl: string) {
    return this._http.get(this.apiPrefix('triggers?filter[ref]=' + triggerWhereUrl)).toPromise()
      .then(response => response.json().data[0]);
  }

  /**
   * Used to get all the triggers installed in the local engine.
   * @returns {Promise<Response>}
   * @deprecated since v0.5.4 after migrating the install API to v2
   */
  getTriggers() {
    return this._http.get(this.apiPrefix('triggers')).toPromise();
  }

  /**
   * Used to install triggers to the local engine.
   * @param {string[]} urls of the triggers which are to be installed to the local engine
   * @returns {Promise<Response>}
   * @deprecated since v0.5.4 after migrating the install API to v2
   */
  installTriggers(urls: string[]) {

    const body = JSON.stringify({
      'urls': urls
    });

    const headers = new Headers({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });

    const options = new RequestOptions({ headers: headers });

    return this._http.post(this.apiPrefix('triggers'), body, options)
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
