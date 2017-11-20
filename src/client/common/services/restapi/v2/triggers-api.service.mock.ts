import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/toPromise';

@Injectable()
export class RESTAPITriggersServiceMock {
  constructor(private http: Http) {
  }

  createTrigger(appId, trigger: any) {
    return Promise.resolve({});
  }

  listTriggersApp(appId) {
    const existing = [
      {
        ref: 'github.com/TIBCOSoftware/flogo-contrib/trigger/coap',
        id: 1
      },
      {
        ref: 'github.com/TIBCOSoftware/flogo-contrib/trigger/mqtt',
        id: 2
      },
      {
        ref: 'github.com/TIBCOSoftware/flogo-contrib/trigger/rest',
        id: 3
      }
    ];

    return Promise.resolve(existing);
  }

}
