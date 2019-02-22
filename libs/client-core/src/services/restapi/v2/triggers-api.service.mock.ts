import { Injectable } from '@angular/core';

@Injectable()
export class TriggersApiServiceMock {
  constructor() {}

  createTrigger(appId, trigger: any) {
    return Promise.resolve({});
  }

  listTriggersForApp(appId) {
    const existing = [
      {
        ref: 'some_path_to_repo/trigger/coap',
        id: 1,
      },
      {
        ref: 'some_path_to_repo/trigger/mqtt',
        id: 2,
      },
      {
        ref: 'some_path_to_repo/trigger/rest',
        id: 3,
      },
    ];

    return Promise.resolve(existing);
  }
}
