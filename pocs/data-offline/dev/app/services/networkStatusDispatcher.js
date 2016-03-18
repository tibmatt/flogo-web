import {Injectable} from 'angular2/core';
import {NetworkStatusService} from './networkStatusService';
import {AppStore, appStore} from '../stores/appStore';
import {NetworkStatusActions} from '../actions/networkStatusActions';


@Injectable()
export class NetworkStatusDispatcher {

  static get parameters() {
    return [ [NetworkStatusService], [AppStore], [NetworkStatusActions] ]
  }

  constructor(networkStatusService, appStore, networkStatusActions) {
    this._networkStatusService = networkStatusService;
    this._appStore = appStore;
    this._networkStatusActions = networkStatusActions;


    //TODO maybe we need to define a method that subscribe or desubribe this one
    this._networkStatusService.networkStatus
      .subscribe( (status) => {
        this._appStore.dispatch(this._networkStatusActions.setStatus(status.type));
      });

  }

}
