import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions } from '@angular/http';
import 'rxjs/add/operator/toPromise';
import { IFlogoApplicationModel } from '../../application.model';

const UNTITLED_APP = 'Untitled App';

@Injectable()
export class RESTAPIApplicationsService {
    private applications : Array<IFlogoApplicationModel> = [
        {
            id: "1",
            name: "Sample Application 1",
            version: "0.0.1",
            description: "My App",
            createdAt: new Date(),
            updatedAt: new Date(),
            flows: [
                {
                    id: '897',
                    name: 'Manually adjust temperature',
                    description: 'A flow for apietusam faccum esequi berum. Hentias porerum ent omniend itatempoer porem uga. Luptati optaquisist quibus rem quam unt Hentias porerum ent omniend itatempoer porem uga. Luptati optaquisist quibus rem quam unt Luptas oilsksd as asdfwo',
                    createdAt: new Date()
                },
                {
                    id: '987',
                    name: 'Raise temperature & notifiy operator',
                    description: 'A basic flow for apietusam faccum esequi berum. Hentias porerum ent omniend itatempoer porem uga. Luptati optaquisist quibus rem quam unt',
                    createdAt: new Date()
                },
                {
                    id: '879',
                    name: 'Log temperature',
                    description: 'A complex flow for apietusam faccum esequi berum. Hentias porerum ent omniend itatempoer porem uga. Luptati optaquisist quibus rem quam unt',
                    createdAt: new Date()
                }
            ]
        },
        {
            id: "2",
            name: "Sample Application 2",
            version: "0.0.1",
            description: "My App",
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: "3",
            name: "Sample Application 3",
            version: "0.0.1",
            description: "My App",
            createdAt: new Date(),
            updatedAt: new Date()
        },      {
            id: "4",
            name: "Sample Application 4",
            version: "0.0.1",
            description: "My App",
            createdAt: new Date(),
            updatedAt: new Date()
        },      {
            id: "5",
            name: "Sample Application 5",
            version: "0.0.1",
            description: "My App",
            createdAt: new Date(),
            updatedAt: new Date()
        },      {
            id: "6",
            name: "Sample Application 6",
            version: "0.0.1",
            description: "My App",
            createdAt: new Date(),
            updatedAt: new Date()
        },      {
            id: "7",
            name: "Sample Application 7",
            version: "0.0.1",
            description: "My App",
            createdAt: new Date(),
            updatedAt: new Date()
        },      {
            id: "8",
            name: "Sample Application 8",
            version: "0.0.1",
            description: "My App",
            createdAt: new Date(),
            updatedAt: new Date()
        },      {
            id: "9",
            name: "Sample Application 9",
            version: "0.0.1",
            description: "My App",
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: "10",
            name: "Sample Application 10",
            version: "0.0.1",
            description: "My App",
            createdAt: new Date(),
            updatedAt: new Date()
        }
    ];


    private recent: Array<any> = [
        {
            application: "Refrigerated containers",
            flow: "Lower temperature & notify operator"
        },
        {
            application: "Refrigerated containers",
            flow: "Log temperature"
        },
        {
            application: "Robotic take-over",
            flow: "Monitor weapon production status"
        }
    ];


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
      let flows = [];

      return new Promise((resolve, reject)=> {
          this.applications.forEach((application)=> {
              if(application.flows && application.flows.length) {
                  flows = flows.concat(application.flows);
              }
          });

          resolve(flows);
      });
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
