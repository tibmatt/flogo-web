import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions } from '@angular/http';
import 'rxjs/add/operator/toPromise';
import { IFlogoApplicationModel } from '../../../common/application.model';

@Injectable()
export class RESTAPIApplicationsService {
    private mockApplications: Array<IFlogoApplicationModel> = [];

  constructor(public _http : Http ) {
      this.mockApplications = [
          {
              id: "1",
              name: "Sample Application 1",
              version: "0.0.1",
              description: "My App",
              createdAt: new Date(),
              updatedAt: new Date()
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
  }

  list() {
      return new Promise((resolve, reject)=> {
          resolve(this.mockApplications);
      });
  }

  add(application:IFlogoApplicationModel)   {
      this.mockApplications.unshift(application);
  }

  delete(id:string)   {
      _.remove(this.mockApplications, (n:IFlogoApplicationModel)=> {
          return n.id === id;
      });

      return new Promise((resolve, reject)=> {
          resolve(true);
      });

  }


}
