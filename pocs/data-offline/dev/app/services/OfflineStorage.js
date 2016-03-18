import {Injectable} from 'angular2/core';
import {ReplaySubject} from 'rxjs/Rx';

import * as localStorage from '../lib/localforage';

import {AppStore, appStore} from '../stores/appStore';
debugger;


@Injectable()
export class OfflineStorage {

  static get parameters() {
    return [ [AppStore] ];
  }
  constructor(appStore) {
    this._appStore  = appStore;
  }

  //Persist the state to the browser
  persist() {

    localStorage.setItem('PETS_APP', this._appStore.getState())
      .then(() => {
        debugger;
      });

  }

  getPersistedData() {
    localStorage.getItem('PETS_APP')
      .then(value => {
        debugger;
      });

  }

}
