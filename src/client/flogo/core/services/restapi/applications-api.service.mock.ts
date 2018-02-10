import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/toPromise';

import { App } from '@flogo/core';
import { RESTAPIApplicationsService } from './applications-api.service';
import { ErrorService } from '../error.service';
import { HttpUtilsService } from './http-utils.service';

const UNTITLED_APP = 'Untitled App';

@Injectable()
export class RESTAPIApplicationsServiceMock extends RESTAPIApplicationsService {

  private mockApplications: Array<App> = [
    {
      id: '1',
      name: 'Sample Application 1',
      version: '0.0.1',
      description: null, /* should be null for test */
      createdAt: new Date(),
      updatedAt: null, /* should be null for test */
      /* tslint:disable:max-line-length */
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
      id: '2',
      name: 'Sample Application 2',
      version: '0.0.1',
      description: 'My App',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];
  /* tslint:enable:max-line-length */

  constructor(public _http: Http, errorService: ErrorService, httpUtils: HttpUtilsService) {
    super(_http, errorService, httpUtils);
  }

  getAllApps() {
    return new Promise((resolve, reject) => {
      resolve(this.mockApplications);
    });
  }

  createNewApp() {
    const application: any = {
      id: this.mockApplications.length + 1,
      name: this.determineUniqueName(UNTITLED_APP),
      version: '',
      description: '',
      createdAt: new Date(),
      updatedAt: null
    };
    this.mockApplications.unshift(application);

    return new Promise((resolve, reject) => {
      resolve(application);
    });
  }

  deleteApp(id: string) {
    _.remove(this.mockApplications, (n: App) => {
      return n.id === id;
    });

    return new Promise((resolve, reject) => {
      resolve(true);
    });
  }

  getApp(id: string) {
    const application = this.mockApplications.find((item) => {
      return item.id === id;
    });

    return new Promise((resolve, reject) => {
      resolve(application);
    });
  }

  determineUniqueName(name: string, count = 0) {
    const appName: string = name + (count > 0 ? ` (${count})` : '');
    let found: App;

    found = this.mockApplications.find((app: App) => {
      return app.name === appName;
    });

    if (found) {
      return this.determineUniqueName(name, ++count);
    } else {
      return appName;
    }
  }


}
