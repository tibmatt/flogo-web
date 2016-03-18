import {Injectable} from 'angular2/core';
import {Observable} from 'rxjs/Rx';

@Injectable()
export class NetworkStatusService {

  constructor() {

    let DOMElement = window;
    this._sourceNetworkStatus = Observable.merge(
      Observable.fromEvent(DOMElement,'offline'),
      Observable.fromEvent(DOMElement,'online'));

  }

  get networkStatus() {
    return this._sourceNetworkStatus;
  }

}
