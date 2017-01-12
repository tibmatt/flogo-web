import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions } from '@angular/http';
import 'rxjs/add/operator/toPromise';
import { IFlogoApplicationModel } from '../../application.model';

const UNTITLED_APP = 'Untitled App';

@Injectable()
export class RESTAPIApplicationsService {

  constructor(public _http : Http ) {
  }

  recentFlows() {
    return this._http.get('/v1/api/flows/recent').toPromise()
      .then(response=> response.json().data);
  }

  getAllApps() {
    return this._http.get('/v1/api/apps').toPromise()
      .then(response => {
        if (response.text()) {
          let apps: Array<IFlogoApplicationModel> = response.json().data;
          return apps;
        } else {
          return response;
        }
      });
  }

  allFlows()   {
    return this._http.get('/v1/api/flows').toPromise()
      .then(response=> response.json());
  }

  createNewApp(): Promise<any> {
    return this.getNewAppName(UNTITLED_APP).then( appName => {
      let application: any = {
        name: appName,
        version: '',
        description: ''
      };

      let headers = new Headers({'Content-Type': 'application/json'});
      let options = new RequestOptions({headers: headers});
      let body = JSON.stringify(application);

      return this._http.post('/v1/api/apps', body, options).toPromise()
       .then(response => response.json().data);
    })
  }

  deleteApp(appId:string)   {
    return this._http.delete('/v1/api/apps/' + appId).toPromise();
  }

  getApp(appId: string) {
    return this._http.get('/v1/api/apps/' + appId).toPromise()
      .then(response => {
        if (response.text()) {
          let app: IFlogoApplicationModel = response.json().data;
          return app;
        } else {
          return response;
        }
      });
  }

  updateApp(appId:string, app:any){
    let headers = new Headers({'Content-Type': 'application/json'});
    let options = new RequestOptions({headers: headers});
    let body = JSON.stringify(app);

    return this._http.patch('/v1/api/apps/' + appId, body, options).toPromise()
      .then(response => response.json().data);
  }

  getNewAppName(name: string, count = 0) {
    let appName: string = name + (count > 0 ? ` (${count})` : '');
    let found: IFlogoApplicationModel;

    return this.getAllApps().then((apps:Array<IFlogoApplicationModel>) => {
      found = _.find(apps, (app: IFlogoApplicationModel) => {
        return app.name == appName;
      });
      if (found) {
        return this.getNewAppName(name, ++count);
      } else {
        return appName;
      }
    });

  }
}
