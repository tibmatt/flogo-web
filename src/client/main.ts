import {enableProdMode} from '@angular/core';
import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';
import {MainModule} from './main.module'
if(typeof window['DEV'] != 'undefined' && window['DEV']) {
  console.log('Development env ON');
} else {
  enableProdMode();
}

platformBrowserDynamic().bootstrapModule(MainModule);
