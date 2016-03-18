import {Injectable} from 'angular2/core';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/distinctUntilChanged';

const MAX_TRIES = 2;

@Injectable()
export class OfflineCheckerService {
  _isOnline;
  _countFailedTries;
  _timerStream;

  constructor() {
    this.setOnline();
    this._timerStream = Observable.timer(0,1000)
      .map( x => {

        if(!window.navigator.onLine) {

          this._countFailedTries += 1;

          if(this._countFailedTries >= MAX_TRIES)  {
            this.setOffline();
            return 'offline';
          } else {
            return 'still-online';
          }

        } else {

          if(this._isOnline === false)  {
            this.setOnline();
            return 'back-to-online';
          }
          else {
            this.setOnline();
            return 'online';
          }
        }
      })
    .distinctUntilChanged()
    .share();

    this._networkStatus = this._timerStream
      .map(status => status == 'online' || status == 'back-to-online')
      .distinctUntilChanged()
      .share();

  }

  setOnline() {
    this._isOnline = true;
    this._countFailedTries = 0;
  }
  setOffline() {
    this._isOnline = false;
  }

  get timerStream() {
    return this._timerStream;
  }

  get networkStatusStream() {
    return this._networkStatus;
  }
}
