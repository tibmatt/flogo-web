import {Component, provide, View, NgZone} from 'angular2/core';
import {AppStore, appStore} from '../stores/appStore';
import {NetworkStatusService} from '../services/networkStatusService';
import {NetworkStatusDispatcher} from '../services/networkStatusDispatcher';
import {NetworkStatusActions} from '../actions/networkStatusActions';
import {PetActions} from '../actions/petActions';
import {PetsService} from '../services/PetsService';
import {PetsServiceOnline} from '../services/PetsServiceOnline';
import {PetsServiceOffline} from '../services/PetsServiceOffline';
import {OfflineStorage} from '../services/OfflineStorage';

@Component({
  directives:[],
  selector: 'demo-app',
  providers: [provide(AppStore, {useValue: appStore}),  NetworkStatusService,
    NetworkStatusDispatcher, NetworkStatusActions, PetActions, PetsService, PetsServiceOnline, PetsServiceOffline, OfflineStorage ],
  templateUrl: './demo.app.component/templates/demo.app.component.html'
})

export class DemoAppComponent {

  static get parameters() {
    return [ [AppStore],  [NetworkStatusService], [NetworkStatusDispatcher], [PetActions], [NgZone], [PetsService], [OfflineStorage] ];
  }

  constructor(appStore,  networkStatusServices, networkStatusDispatcher, petActions, ngZone, petsService, offlineStorage ) {
    this._appStore = appStore;
    this._networkStatusServices = networkStatusServices;
    this._networkStatusDispatcher = networkStatusDispatcher;
    this._petActions = petActions;
    this._ngZone = ngZone;
    this._petsService = petsService;
    this._offlineStorage = offlineStorage;


    this.state = {};
    this.syncing = false;
  }


  ngOnInit() {
    // we subscribe to store events
    this._appStore.subscribe(()=> {
      this._ngZone.run(() => {
        this.state = Object.assign({}, this._appStore.getState());
        debugger;
        if(this.isOnline() && this._petsService.hasOfflineItems() ) {
          this.syncPets();
        }
      });
    });

    this.loadPets();
  }

  isOnline() {
    return this.state.networkStatus == 'offline' ? false: true;
  }

  syncPets() {
    this.syncing = true;

    setTimeout(() => {
      this._petsService.sync();
      this.syncing = false;
    },2000);
  }

  loadPets() {
    this._petsService.getAll()
        .subscribe((data) => {
          this._appStore.dispatch(this._petActions.loadPets(data));
        });
  }

  addPet(name, kind) {
    let postAdd = (res) => {
      debugger;
      if(res.isRemoteOperation) {
        this.loadPets();
      }
    };

    this._petsService.add({name, kind})
      .subscribe(postAdd,
                 err => console.log('Error:' + err));
  }


  clearInputs(petname, kind) {
    petname.value = '';
    kind.value = '';
  }

  persistToOfflineStorage() {
    this._offlineStorage.persist();
    alert('persisting');
  }

  getPersistedData() {
    this._offlineStorage.getPersistedData();
  }


}
