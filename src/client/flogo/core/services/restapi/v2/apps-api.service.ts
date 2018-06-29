import { Injectable } from '@angular/core';
import { Http, Response, URLSearchParams } from '@angular/http';
import { HttpClient, HttpParams } from '@angular/common/http';
import 'rxjs/add/operator/toPromise';
import 'rxjs/add/operator/map';

import { App } from '@flogo/core';
import { FLOGO_PROFILE_TYPE, TYPE_APP_MODEL, APP_MODELS } from '../../../constants';
import { HttpUtilsService } from '../http-utils.service';
import { FileDownloaderService } from '@flogo/core/services/file-downloader.service';

const UNTITLED_APP = 'Untitled App';

@Injectable()
export class AppsApiService {

  constructor(
    private http: Http,
    private httpUtils: HttpUtilsService,
    private httpClient: HttpClient,
    private downloadService: FileDownloaderService,
  ) {}

  recentFlows() {
    return this.http.get(this.apiPrefix('actions/recent'), this.httpUtils.defaultOptions()).toPromise()
      .then(response => response.json().data);
  }

  createNewApp(profileDetails): Promise<any> {
    return this.determineUniqueName(UNTITLED_APP).then(appName => {
      const application: any = {
        type: 'flogo:app',
        name: appName,
        version: '',
        description: ''
      };
      if (profileDetails.profileType === FLOGO_PROFILE_TYPE.DEVICE) {
        application.type = 'flogo:device';
        application.device = {};
        application.device.profile = profileDetails.profile;
        application.device.deviceType = profileDetails.deviceType;
        application.device.settings = profileDetails.settings || {};
      }

      const options = this.httpUtils.defaultOptions();

      return this.http.post(this.apiPrefix('apps/'), application, options).toPromise()
        .then(response => response.json().data);
    });
  }

  listApps(): Promise<App[]> {
    return this.http.get(this.apiPrefix('apps'), this.httpUtils.defaultOptions())
      .map(response => response.json())
      .map(responseBody => responseBody.data ? responseBody.data : [])
      .toPromise();
  }

  getApp(appId: string): Promise<App | null> {
    return this.http.get(this.apiPrefix(`apps/${appId}`))
      .map(response => response.json())
      .map(responseBody => responseBody.data ? <App> responseBody.data : null)
      .toPromise();
  }

  updateApp(appId: string, app: any) {
    const options = this.httpUtils.defaultOptions();

    return this.http.patch(this.apiPrefix(`apps/${appId}`), app, options)
      .toPromise()
      .then(response => response.json())
      .then(body => body.data)
      .catch(error => Promise.reject(this.extractErrors(error)));
  }

  deleteApp(appId: string) {
    const options = this.httpUtils.defaultOptions();

    return this.http.delete(this.apiPrefix(`apps/${appId}`), options)
      .toPromise()
      .then(response => true)
      .catch(error => Promise.reject(this.extractErrors(error)));
  }

  // todo: combine with exportflows
  exportApp(appId: string, options: { appModel?: TYPE_APP_MODEL } = {}) {
    let searchOptions: URLSearchParams;
    if (options.appModel) {
      searchOptions = new URLSearchParams();
      searchOptions.set('appmodel', options.appModel);
    }
    const requestOptions = this.httpUtils.defaultOptions({ search: searchOptions });
    return this.http.get(this.apiPrefix(`apps/${appId}:export`), requestOptions)
      .map(response => response.json())
      .toPromise()
      .catch(err => Promise.reject(err.json()));
  }

  // todo: combine with exportapp
  exportFlows(appId: string, flowIds: any[], appModel?: TYPE_APP_MODEL) {
    let reqOptions = this.httpUtils.defaultOptions();
    const searchParams = new URLSearchParams();
    searchParams.set('type', 'flows');
    if (flowIds && flowIds.length > 0) {
      const selectedFlowIds = flowIds.join(',');
      searchParams.set('flowids', selectedFlowIds);
    }
    if (appModel) {
      searchParams.set('appmodel', appModel);
    }
    reqOptions = reqOptions.merge({
      search: searchParams
    });
    return this.http.get(
      this.httpUtils.apiPrefix(`apps/${appId}:export`), reqOptions)
      .map((res: Response) => res.json())
      .toPromise()
      .catch(err => Promise.reject(err.json()));
  }

  uploadApplication(application) {
    const options = this.httpUtils.defaultOptions();

    return this.http.post(this.apiPrefix('apps:import'), application, options).toPromise()
      .then(response => response.json())
      .catch(error => Promise.reject(this.extractErrors(error)));
  }

  downloadAppLink(appId: string) {
    return this.apiPrefix(`apps/${appId}/build`);
  }

  buildAndDownload(appId: string, { os, arch }) {
    const url = this.downloadAppLink(appId);
    const params = new HttpParams({ fromObject: { os, arch } });
    return this.httpClient.get(url, { params, responseType: 'blob', observe: 'response' })
      .pipe(this.downloadService.downloadResolver());
  }

  determineUniqueName(name: string) {
    return this.listApps().then((apps: Array<App>) => {
      const normalizedName = name.trim().toLowerCase();
      const possibleMatches = apps
        .map(app => app.name.trim().toLowerCase())
        .filter(appName => appName.startsWith(normalizedName));

      if (!possibleMatches.length) {
        return name;
      }

      let found = true;
      let index = 0;
      while (found) {
        index++;
        found = possibleMatches.includes(`${normalizedName} (${index})`);
      }
      return `${name} (${index})`;

    });

  }

  private apiPrefix(path) {
    return this.httpUtils.apiPrefix(path, 'v2');
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

}
