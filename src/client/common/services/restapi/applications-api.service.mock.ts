import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions } from '@angular/http';
import 'rxjs/add/operator/toPromise';
import { IFlogoApplicationModel } from '../../../common/application.model';
import { RESTAPIApplicationsService } from './applications-api.service';

const UNTITLED_APP = 'Untitled App';

@Injectable()
export class RESTAPIApplicationsServiceMock  extends RESTAPIApplicationsService {

    private mockApplications: Array<IFlogoApplicationModel> = [
        {
            id: "1",
            name: "Sample Application 1",
            version: "0.0.1",
            description: null, /* should be null for test */
            createdAt: new Date(),
            updatedAt: null   /* should be null for test */
        },
        {
            id: "2",
            name: "Sample Application 2",
            version: "0.0.1",
            description: "My App",
            createdAt: new Date(),
            updatedAt: new Date()
        }
    ];

  constructor(public _http : Http ) {
      super(_http);
  }

  list() {
      return new Promise((resolve, reject)=> {
          resolve(this.mockApplications);
      });
  }

  add()   {
      let application:any = {
          id: this.mockApplications.length + 1,
          name: this.getNewAppName(UNTITLED_APP),
          version: '',
          description: '',
          createdAt: new Date(),
          updatedAt: null
      };
      this.mockApplications.unshift(application);

      return new Promise((resolve, reject)=> {
          resolve(application);
      });
  }

  delete(id:string)   {
      _.remove(this.mockApplications, (n:IFlogoApplicationModel)=> {
          return n.id === id;
      });

      return new Promise((resolve, reject)=> {
          resolve(true);
      });
  }

  get(id:string)   {
      let application = this.mockApplications.find((item)=> {
          return item.id == id;
      });

      return new Promise((resolve, reject)=> {
          resolve(application);
      });
  }

    getNewAppName(name:string, count = 0) {
        let appName:string = name +  (count > 0 ?   ` (${count})` : '');
        let found: IFlogoApplicationModel;

        found = this.mockApplications.find((app: IFlogoApplicationModel)=> {
            return app.name == appName;
        });

        if(found) {
            return this.getNewAppName(name , ++count);
        } else {
            return appName;
        }
    }


}
