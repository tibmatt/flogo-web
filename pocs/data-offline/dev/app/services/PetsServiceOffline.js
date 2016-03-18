import {Injectable} from 'angular2/core';
import {ReplaySubject} from 'rxjs/Rx';
import {PetActions} from '../actions/petActions';
import {AppStore, appStore} from '../stores/appStore';


@Injectable()
export class PetsServiceOffline {

  static get parameters() {
    return [ [AppStore], [PetActions] ];
  }

  constructor(appStore, petActions) {
    this._appStore = appStore;
    this._petActions = petActions;
  }

  getAll() {
    var subject = new ReplaySubject(2);

    //TODO Make it generic, we are coupling pets property
    subject.next(this._appStore.getState().pets);

    return subject;
  }

  add(pet) {
    var subject = new ReplaySubject(2);

    this._appStore.dispatch(this._petActions.addPet(pet));
    subject.next({data:pet, isRemoteOperation:false});

    return subject;
  }



}
