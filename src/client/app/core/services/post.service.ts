import { Injectable } from '@angular/core';

@Injectable()
export class PostService {

  constructor() {
    if (!postal) {
      console.error('PostService depends on postal, it seems you did not load postal');
    }
  }

  publish(envelope: any) {
    return postal.publish(envelope);
  }

  subscribe(options: any) {
    return postal.subscribe(options);
  }

  unsubscribe(sub: any) {
    return postal.unsubscribe(sub);
  }
}
