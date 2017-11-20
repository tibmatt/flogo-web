import { Injectable } from '@angular/core';
import { Headers, Http, RequestOptions, Response, URLSearchParams } from '@angular/http';
import 'rxjs/add/operator/toPromise';

import { IFlogoApplicationModel } from '../../application.model';
import { ErrorService } from '../../../common/services/error.service';
import { HttpUtilsService } from './http-utils.service';

const UNTITLED_APP = 'Untitled App';

@Injectable()
export class RESTAPIApplicationsService {

  constructor(private http: Http, private errorService: ErrorService, private httpUtils: HttpUtilsService) {
  }

  recentFlows() {
    return this.http.get(this.apiPrefix('flows/recent')).toPromise()
      .then(response => response.json().data);
  }

  getAllApps(): Promise<IFlogoApplicationModel[]> {
    return this.http.get(this.apiPrefix('apps')).toPromise()
      .then(response => {
        const appsResponse = response.json();
        return appsResponse && appsResponse.data ? appsResponse.data : [];
      });
  }

  allFlows() {
    return this.http.get(this.apiPrefix('flows')).toPromise()
      .then(response => response.json());
  }

  createNewApp(): Promise<any> {
    return this.determineUniqueName(UNTITLED_APP).then(appName => {
      const application: any = {
        name: appName,
        version: '',
        description: ''
      };

      const headers = new Headers({ 'Content-Type': 'application/json' });
      const options = new RequestOptions({ headers: headers });
      const body = JSON.stringify(application);

      return this.http.post(this.apiPrefix('apps'), body, options).toPromise()
        .then(response => response.json().data);
    });
  }

  deleteApp(appId: string) {
    return this.http.delete(this.apiPrefix('apps/' + appId)).toPromise();
  }

  getApp(appId: string): Promise<IFlogoApplicationModel> {
    return this.http.get(this.apiPrefix('apps/' + appId)).toPromise()
      .then(response => {
        if (response.text()) {
          return response.json().data;
        }
        return null;
      });
  }

  updateApp(appId: string, app: any) {
    const headers = new Headers({ 'Content-Type': 'application/json' });
    const options = new RequestOptions({ headers: headers });

    return this.http.patch(this.apiPrefix(`apps/${appId}`), app, options).toPromise()
      .then(response => this.extractData(response))
      .catch(error => Promise.reject(this.extractErrors(error)));
  }

  export(appId: string) {
    const headers = new Headers({ 'Content-Type': 'application/json' });
    const options = new RequestOptions({ headers: headers });

    return this.http.get(this.apiPrefix(`apps/${appId}/export`), options).toPromise()
      .then(response => response.json())
      .catch(error => Promise.reject(this.extractErrors(error)));
  }

  determineUniqueName(name: string) {
    return this.getAllApps().then((apps: Array<IFlogoApplicationModel>) => {
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

  uploadApplication(file: File, appName: string = '') {
    const formData: FormData = new FormData();
    formData.append('importFile', file, file.name);

    const searchParams = new URLSearchParams();
    searchParams.set('appName', appName);
    const headers = new Headers({ Accept: 'application/json' });
    const requestOptions = new RequestOptions({ headers, search: searchParams });

    return this.http.post(this.apiPrefix('apps/import'), formData, requestOptions).toPromise()
      .then(response => this.extractData(response))
      .catch(error => Promise.reject(this.extractErrors(error)));
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
    return this.httpUtils.apiPrefix(path, 'v1');
  }
}
