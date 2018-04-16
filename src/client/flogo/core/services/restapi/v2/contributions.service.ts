import { Injectable } from '@angular/core';
import { Headers, Http, RequestOptions } from '@angular/http';
import { HttpUtilsService } from '../http-utils.service';
import 'rxjs/add/operator/toPromise';
import {FLOGO_PROFILE_TYPE} from '@flogo/core/constants';

interface InstallationData {
  url: string;
  type?: string;
}

@Injectable()
export class RESTAPIContributionsService {
  pathToService = 'contributions/devices';

  constructor(private _http: Http, private httpUtils: HttpUtilsService) {
  }

  getContributionDetails(ref: string) {
    return this._http.get(this.httpUtils.apiPrefix(this.pathToService + '?filter[ref]=' + ref)).toPromise()
      .then(response => response.json().data[0]);
  }

  listContribs(type) {
    return this._http.get(this.httpUtils.apiPrefix(this.pathToService + '?filter[type]=' + type)).toPromise();
  }

  installContributions({profileType, installType, url}) {
    const body = JSON.stringify(this.prepareBodyData(profileType, installType, url));

    const headers = new Headers({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });

    const options = new RequestOptions({ headers: headers });

    return this._http.post(this.apiPrefix(profileType), body, options).map(res => res.json()).toPromise();

  }

  private prepareBodyData(profileType, type, url): InstallationData {
    const data: InstallationData = {url};
    if (profileType === FLOGO_PROFILE_TYPE.MICRO_SERVICE) {
      data.type = type;
    }
    return data;
  }

  private apiPrefix(profileType: FLOGO_PROFILE_TYPE) {
    const commonPath = 'contributions/';
    let pathToService;
    if (profileType === FLOGO_PROFILE_TYPE.DEVICE) {
      pathToService = commonPath + 'devices';
    } else {
      pathToService = commonPath + 'microservices';
    }
    return this.httpUtils.apiPrefix(pathToService);
  }
}
