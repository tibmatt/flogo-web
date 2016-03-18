import {Injectable} from "angular2/core";
import {Observable} from "rxjs/Observable";
import {Subject} from "rxjs/Subject";
import {BehaviorSubject} from "rxjs/Rx";

import {OfflineCheckerService as NetworkStatus} from "../poc-offline.checker/poc-offline.checker.service";
import {FileStatusService} from './FileStatusService';

@Injectable()
export class UIStateService {

  static get parameters() {
    return [[NetworkStatus], [FileStatusService]]
  }

  constructor(networkStatus, fileStatus) {

    this._stateSource = new BehaviorSubject({
      file: {
        isLoading: false,
        isSaving: false
      },
      networkStatus: {
        isOnline: true
      }
    });

    networkStatus.networkStatusStream
      .subscribe(isOnline => { // update online state
        this._updateState((nextState, cb) => {
          nextState.networkStatus.isOnline = isOnline;
          cb(nextState);
        });
      });

    fileStatus.savingStatus
      .distinctUntilChanged()
      .subscribe(isSaving => {
        this._updateState((nextState, cb) => {
          nextState.file.isSaving = isSaving;
          cb(nextState);
        })
      });

  }

  get state() {
    return this._stateSource.asObservable();
  }

  _updateState(fn) {

    let currentState = this._stateSource.getValue();
    let nextState = Object.assign({}, currentState);
    let doUpdate = newState => this._stateSource.next(newState);

    fn(nextState, doUpdate);

  }

}
