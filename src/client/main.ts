import {provide, enableProdMode, ComponentRef} from '@angular/core';
import {bootstrap} from '@angular/platform-browser-dynamic';
import {ROUTER_PROVIDERS} from '@angular/router-deprecated';
import {APP_BASE_HREF} from '@angular/common'
import {FlogoAppComponent} from './app/flogo/components/flogo.component';
import { appInjector } from './common/services/injector.service';

if(typeof window['DEV'] != 'undefined' && window['DEV']) {
  console.log('Development env ON');
} else {
  enableProdMode();
}

bootstrap(FlogoAppComponent, [
  ROUTER_PROVIDERS,
  provide(APP_BASE_HREF, { useValue: '/'})
])
.then((appRef: ComponentRef) => {
  // store the reference to the application injector
  appInjector(appRef.injector);
});

// In order to start the Service Worker located at "./sw.js"
// uncomment this line. More about Service Workers here
// https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers
// if ('serviceWorker' in navigator) {
//   (<any>navigator).serviceWorker.register('./sw.js').then(function(registration) {
//     console.log('ServiceWorker registration successful with scope: ',    registration.scope);
//   }).catch(function(err) {
//     console.log('ServiceWorker registration failed: ', err);
//   });
// }
