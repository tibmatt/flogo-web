"use strict";
var appInjectorRef;
exports.appInjector = function (injector) {
    if (injector) {
        appInjectorRef = injector;
    }
    return appInjectorRef;
};
