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
var http_1 = require('@angular/http');
var Observable_1 = require('rxjs/Observable');
var Rx_1 = require("rxjs/Rx");
var utils_1 = require('../../../common/utils');
var PING_INTERVAL_MS = 2500;
var ServiceStatusIndicatorComponent = (function () {
    function ServiceStatusIndicatorComponent(http) {
        this.http = http;
        this.urlConfig = null;
        this.status = null;
        this.statusCode = null;
        this.configChangeSubject = null;
        this.subscription = null;
        this.colors = {
            'online': 'green',
            'online-warning': 'gold',
            'offline': 'red',
            'unknown': 'orange'
        };
        this.configChangeSubject = new Rx_1.BehaviorSubject(this.urlConfig);
    }
    ServiceStatusIndicatorComponent.prototype.ngOnInit = function () {
        var _this = this;
        var configChangeStream = this.configChangeSubject.distinctUntilChanged();
        configChangeStream.subscribe(function () { return _this.status = null; });
        this.subscription = Observable_1.Observable
            .interval(PING_INTERVAL_MS)
            .combineLatest(configChangeStream)
            .map(function (combined) { return combined[1]; })
            .map(function (config) {
            var headers = new http_1.Headers({ 'Content-Type': 'application/json' });
            var options = new http_1.RequestOptions({ headers: headers });
            var body = JSON.stringify({ config: config });
            return _this.http.post('/v1/api/ping/service', body, options);
        })
            .switch()
            .catch(function (error) {
            _this.statusCode = error.status;
            if (error.status != 500) {
                _this.status = 'online-warning';
            }
            else {
                _this.status = 'offline';
            }
            return Observable_1.Observable.throw(error);
        })
            .retry()
            .subscribe(function (result) {
            _this.status = 'online';
            _this.statusCode = result.status;
        });
    };
    ServiceStatusIndicatorComponent.prototype.ngDoCheck = function () {
        this.configChangeSubject.next(this.urlConfig);
    };
    ServiceStatusIndicatorComponent.prototype.ngOnDestroy = function () {
        console.log('Destroying', this.buildUrl());
        if (this.subscription) {
            console.log('Unsubscribing');
            this.subscription.unsubscribe();
        }
        else {
            console.log('Not unsubscribing');
        }
    };
    Object.defineProperty(ServiceStatusIndicatorComponent.prototype, "color", {
        get: function () {
            return this.colors[this.status] || this.colors.unknown;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ServiceStatusIndicatorComponent.prototype, "info", {
        get: function () {
            if (this.status == 'online-warning') {
                return "Online but returned status code " + this.statusCode;
            }
            return '';
        },
        enumerable: true,
        configurable: true
    });
    ServiceStatusIndicatorComponent.prototype.buildUrl = function () {
        if (this.urlConfig) {
            var config = this.urlConfig;
            var name_1 = this.urlConfig.name ? "/" + this.urlConfig.name : '';
            var testPath = this.urlConfig.testPath ? "/" + this.urlConfig.testPath : '';
            return "" + utils_1.getURL(config) + name_1 + testPath;
        }
        return null;
    };
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], ServiceStatusIndicatorComponent.prototype, "urlConfig", void 0);
    ServiceStatusIndicatorComponent = __decorate([
        core_1.Component({
            selector: 'flogo-config-service-status-indicator',
            moduleId: module.id,
            template: "<i [title]=\"info\" class=\"fa\" [style.color]=\"color\"\n                [ngClass]=\"{'fa-circle': status == 'online' || status == 'offline' || status == 'online-warning', 'fa-circle-o': !status}\"></i>"
        }), 
        __metadata('design:paramtypes', [http_1.Http])
    ], ServiceStatusIndicatorComponent);
    return ServiceStatusIndicatorComponent;
}());
exports.ServiceStatusIndicatorComponent = ServiceStatusIndicatorComponent;
