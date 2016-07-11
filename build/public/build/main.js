"use strict";
var core_1 = require('@angular/core');
var platform_browser_dynamic_1 = require('@angular/platform-browser-dynamic');
var router_deprecated_1 = require('@angular/router-deprecated');
var common_1 = require('@angular/common');
var flogo_component_1 = require('./app/flogo/components/flogo.component');
var utils_1 = require('./common/utils');
if (typeof window['DEV'] != 'undefined' && window['DEV']) {
    console.log('Development env ON');
}
else {
    core_1.enableProdMode();
}
window.FLOGO_GLOBAL = utils_1.getFlogoGlobalConfig();
platform_browser_dynamic_1.bootstrap(flogo_component_1.FlogoAppComponent, [
    router_deprecated_1.ROUTER_PROVIDERS,
    core_1.provide(common_1.APP_BASE_HREF, { useValue: '/' })
]);
