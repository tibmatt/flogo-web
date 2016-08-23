"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var core_1 = require('@angular/core');
var configuration_api_service_1 = require('./restapi/configuration-api-service');
var utils_1 = require('../../common/utils');
var ConfigurationService = (function () {
    function ConfigurationService(_APIConfiguration) {
        this._APIConfiguration = _APIConfiguration;
        this.configuration = null;
        this.configurationName = 'FLOGO_GLOBAL';
    }
    ConfigurationService.prototype.getLocalOrServerConfiguration = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var config = _this.getFromLocalStorage();
            if (!config) {
                _this.getFromServer()
                    .then(function (configuration) {
                    resolve(configuration);
                })
                    .catch(function (err) {
                    reject(err);
                });
            }
            else {
                resolve(config);
            }
        });
    };
    ConfigurationService.prototype.getConfiguration = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            if (_this.configuration) {
                resolve(_this.configuration);
            }
            else {
                _this.getLocalOrServerConfiguration()
                    .then(function (config) {
                    _this.configuration = config;
                    resolve(_this.configuration);
                });
            }
        });
    };
    ConfigurationService.prototype.getFromLocalStorage = function () {
        var config;
        if (localStorage) {
            config = localStorage.getItem(this.configurationName);
            if (config) {
                try {
                    config = JSON.parse(config);
                }
                catch (e) {
                    console.warn(e);
                }
                return config;
            }
        }
        return config;
    };
    ConfigurationService.prototype.getFromServer = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this._APIConfiguration.getConfiguration()
                .then(function (res) {
                try {
                    var config = utils_1.formatServerConfiguration(res.json());
                    _this.saveToLocalStorage(config);
                    resolve(config);
                }
                catch (exc) {
                    reject(exc);
                }
            })
                .catch(function (err) {
                reject(err);
            });
        });
    };
    ConfigurationService.prototype.saveToLocalStorage = function (config) {
        if (localStorage) {
            localStorage.setItem(this.configurationName, JSON.stringify(config));
        }
    };
    ConfigurationService.prototype.save = function () {
        var _this = this;
        this._APIConfiguration.setConfiguration(this.configuration)
            .then(function (res) {
            _this.saveToLocalStorage(_this.configuration);
        });
    };
    ConfigurationService.prototype.resetConfiguration = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this._APIConfiguration.resetConfiguration()
                .then(function () {
                _this.getFromServer()
                    .then(function (config) {
                    _this.configuration = config;
                    resolve(config);
                });
            })
                .catch(function (err) {
                reject(err);
            });
        });
    };
    ConfigurationService = __decorate([
        core_1.Injectable(), 
        __metadata('design:paramtypes', [configuration_api_service_1.RESTAPIConfigurationService])
    ], ConfigurationService);
    return ConfigurationService;
}());
exports.ConfigurationService = ConfigurationService;
