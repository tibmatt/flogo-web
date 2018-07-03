import { Injectable } from '@angular/core';

@Injectable()
export class TriggersApiServiceMock {
  constructor() {
  }

  createTrigger(appId, trigger: any) {
    return Promise.resolve({});
  }

  listTriggersForApp(appId) {
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
