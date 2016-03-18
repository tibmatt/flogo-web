import {bootstrap} from 'angular2/platform/browser';
import {DemoAppComponent} from './demo.app.component/demo.app.component';
import {ROUTER_PROVIDERS} from 'angular2/router';
import {HTTP_PROVIDERS} from 'angular2/http';
import {Github} from './lib/Github';
import {Auth} from './lib/Auth';
import {OfflineCheckerService} from './poc-offline.checker/poc-offline.checker.service';

bootstrap(DemoAppComponent,[ROUTER_PROVIDERS, HTTP_PROVIDERS, Github, Auth, OfflineCheckerService]);

