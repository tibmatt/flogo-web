import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions, Response, URLSearchParams } from '@angular/http';
import 'rxjs/add/operator/toPromise';

import { IFlogoApplicationModel } from '../../application.model';
import { ErrorService } from '../../../common/services/error.service';

const UNTITLED_APP = 'Untitled App';

@Injectable()
export class RESTAPIApplicationsService {

  constructor(private http: Http, private errorService: ErrorService ) {
  }

  recentFlows() {
    return this.http.get('/v1/api/flows/recent').toPromise()
      .then(response => response.json().data);
  }

  getAllApps(): Promise<IFlogoApplicationModel[]> {
    return this.http.get('/v1/api/apps').toPromise()
      .then(response => {
        let appsResponse = response.json();
        return appsResponse && appsResponse.data ? appsResponse.data : [];
      });
  }

  allFlows()   {
    return this.http.get('/v1/api/flows').toPromise()
      .then(response => response.json());
  }

  createNewApp(): Promise<any> {
    return this.determineUniqueName(UNTITLED_APP).then(appName => {
      let application: any = {
        name: appName,
        version: '',
        description: ''
      };

      let headers = new Headers({'Content-Type': 'application/json'});
      let options = new RequestOptions({headers: headers});
      let body = JSON.stringify(application);

      return this.http.post('/v1/api/apps', body, options).toPromise()
       .then(response => response.json().data);
    });
  }

  deleteApp(appId: string)   {
    return this.http.delete('/v1/api/apps/' + appId).toPromise();
  }

  getApp(appId: string): Promise<IFlogoApplicationModel> {
    return this.http.get('/v1/api/apps/' + appId).toPromise()
      .then(response => {
        if (response.text()) {
          let app: IFlogoApplicationModel = response.json().data;
          return app;
        }
        return null;
      });
  }

  updateApp(appId: string, app: any) {
    let headers = new Headers({ 'Content-Type': 'application/json' });
    let options = new RequestOptions({headers: headers});

    return this.http.patch(`/v1/api/apps/${appId}`, app, options).toPromise()
      .then(response => this.extractData(response))
      .catch(error => Promise.reject(this.extractErrors(error)));
  }

  export(appId: string) {
    let headers = new Headers({ 'Content-Type': 'application/json' });
    let options = new RequestOptions({ headers: headers });

    return this.http.get(`/v1/api/apps/${appId}/export`, options).toPromise()
      .then(response => response.json())
      .catch(error => Promise.reject(this.extractErrors(error)));
  }

  determineUniqueName(name: string) {
    return this.getAllApps().then((apps: Array<IFlogoApplicationModel>) => {
      let normalizedName = name.trim().toLowerCase();
      let possibleMatches = apps
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

  uploadApplication( file: File, appName: string = '') {
    let formData: FormData = new FormData();
    formData.append('importFile', file, file.name);

    let searchParams = new URLSearchParams();
    searchParams.set('appName', appName);
    let headers = new Headers({ Accept: 'application/json' });
    let requestOptions = new RequestOptions({ headers, search: searchParams });

    return this.http.post('/v1/api/apps/import', formData, requestOptions).toPromise()
              .then(response => this.extractData(response) )
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
