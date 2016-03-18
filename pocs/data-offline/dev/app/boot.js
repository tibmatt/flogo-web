import {bootstrap} from 'angular2/platform/browser';
import {DemoAppComponent} from './demo.app.component/demo.app.component';
import {PetsApiService} from './services/petsApiService';
import {NetworkStatusService} from './services/networkStatusService';
import {NetworkStatusDispatcher} from './services/networkStatusDispatcher';
import {HTTP_PROVIDERS} from 'angular2/http';

bootstrap(DemoAppComponent,[PetsApiService,NetworkStatusService, NetworkStatusDispatcher,  HTTP_PROVIDERS]);
