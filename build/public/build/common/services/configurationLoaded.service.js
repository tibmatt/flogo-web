"use strict";
var injector_service_1 = require('./injector.service');
var configuration_service_1 = require('./configuration.service');
exports.isConfigurationLoaded = function () {
    var injector = injector_service_1.appInjector();
    var config = injector.get(configuration_service_1.ConfigurationService);
    return config.getConfiguration()
        .then(function () {
        return true;
    })
        .catch(function (err) {
        console.log(err);
        return false;
    });
};
