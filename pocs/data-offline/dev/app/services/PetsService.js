import {Injectable} from 'angular2/core';
import {ReplaySubject} from 'rxjs/Rx';

import {PetsServiceOnline} from './PetsServiceOnline';
import {PetsServiceOffline} from './PetsServiceOffline';
import {AppStore, appStore} from '../stores/appStore';
import {PetActions} from '../actions/petActions';
import {v1 as getNewId} from '../lib/uuid';

const METADATA = {
  ADD : {
    isNew:   true,
    isSync : false
  }
};

@Injectable()
export class PetsService {
  _pets = {};

  static get parameters() {
    return [ [PetsServiceOnline], [PetsServiceOffline], [AppStore], [PetActions] ];
  }
  constructor(petsServiceOnline, petsServiceOffline, appStore, petActions) {
    this._online = petsServiceOnline;
    this._offline = petsServiceOffline;
    this._appStore  = appStore;
    this._petActions = petActions;

    this._pets = window.navigator.onLine ? this._online : this._offline;

    // if network status changes move to the apropiated service
    this._appStore.subscribe( () => {
      if(this._appStore.getState().networkStatus === 'online') {
        this._pets = this._online;
      } else {
        this._pets = this._offline;
      }
    });

  }

  //TODO _id is harcoded, maybe can change the name in the future
  add(pet) {
    let subject = new ReplaySubject(1);

    this._pets.add(pet)
      .subscribe(res => {
        if(res.isRemoteOperation) {
          debugger;
          res.data.metadata =  this._setMetadata( {
            tempId: res.data._id,
            isNew: false,
            isSync: true
          });
          subject.next(res);
        } else {
          res.data.metadata = this._setMetadata({
            tempId: getNewId(),
            isNew: true,
            isSync: false
          });
          subject.next(res);
        }
      });

    return subject;
  }

  getAll() {
    var subject = new ReplaySubject(1);

    this._pets.getAll()
      .subscribe((items) => {
        debugger;

        items.forEach((item)  => {
          item.metadata = this._setMetadata({
            isNew: false,
            isSync: true,
            tempId: item._id
          });
        });
        debugger;

        subject.next(items);

      });

    return subject;
  }

  sync() {
    let pets = this._storeItems();

    pets.forEach((pet, index) => {
      var meta = pet.metadata;
      if(!meta.isSync && meta.isNew) {
        // TODO pass pet as object so we can reuse the service
        this._online.add({name: pet.name, kind: pet.kind})
          .subscribe((data)=> {
            var action = this._petActions.markPetAsSync(index);
            this._appStore.dispatch(action);
          })
      }
    });
  }

  hasOfflineItems() {
    // TODO pets is coupled
    var items = this._storeItems();

    var offline = items.filter((pet) => {
      return pet.metadata.isSync === false;
    });

    return offline.length;
  }

  _storeItems() {
    return this._appStore.getState().pets;
  }

  _setMetadata(metadata) {
    return Object.assign({}, metadata, {lastUpdate: new Date()});
  }



}
