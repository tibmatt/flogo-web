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
var router_deprecated_1 = require('@angular/router-deprecated');
var service_status_indicator_component_1 = require('./service-status-indicator.component');
var http_1 = require('@angular/http');
var configuration_service_1 = require('../../../common/services/configuration.service');
var configurationLoaded_service_1 = require('../../../common/services/configurationLoaded.service');
var MAIN_DB = 'db';
var DBS_ARR = ['activities', 'triggers', MAIN_DB];
var SERVERS_ARR = ['engine', 'stateServer', 'flowServer'];
var FlogoConfigComponent = (function () {
    function FlogoConfigComponent(_router, http, _configurationService) {
        this._router = _router;
        this.http = http;
        this._configurationService = _configurationService;
        this.location = location;
        this.init();
    }
    FlogoConfigComponent.prototype.init = function () {
        this._config = this._configurationService.configuration;
        this._appDB = _.cloneDeep(this._config[MAIN_DB]);
        this._dbs = _.reduce(this._config, function (result, value, key) {
            if (DBS_ARR.indexOf(key) !== -1) {
                if (!value.testPath) {
                    value.testPath = value.name;
                }
                value.name = value.testPath;
                result.push({
                    _label: _.startCase(key),
                    _key: key,
                    config: value
                });
            }
            return result;
        }, []);
        this._servers = _.reduce(this._config, function (result, value, key) {
            if (SERVERS_ARR.indexOf(key) !== -1) {
                var _display = false;
                if (value && value.port == '8080') {
                    _display = true;
                }
                value.name = key;
                result.push({
                    _label: _.startCase(key),
                    _key: key,
                    _display: _display,
                    config: value
                });
            }
            return result;
        }, []);
    };
    FlogoConfigComponent.prototype.onSave = function () {
        var config = {};
        _.each(this._servers, function (server) {
            if (SERVERS_ARR.indexOf(server._key) !== -1) {
                config[server._key] = _.cloneDeep(server.config);
            }
        });
        _.each(this._dbs, function (db) {
            if (DBS_ARR.indexOf(db._key) !== -1) {
                config[db._key] = _.cloneDeep(db.config);
            }
        });
        console.groupCollapsed('Save configuration');
        console.log(_.cloneDeep(config));
        console.groupEnd();
        this._configurationService.save();
    };
    FlogoConfigComponent.prototype.onCancel = function () {
        this._router.navigate(['FlogoHome']);
    };
    FlogoConfigComponent.prototype.onRestart = function (server) {
        console.log(server);
        var port = server && server.config && server.config.port || undefined;
        if (port == '8080') {
            var headers = new http_1.Headers({
                'Accept': 'application/json'
            });
            var options = new http_1.RequestOptions({ headers: headers });
            this.http.get("/v1/api/engine/restart", options)
                .toPromise()
                .then(function (res) {
                console.log("Restart test engine successful. res: ", res);
            }).catch(function (err) {
                console.log("Restart test engine errror. err: ", err);
            });
        }
    };
    FlogoConfigComponent.prototype.onRestartBuild = function () {
        var headers = new http_1.Headers({
            'Accept': 'application/json'
        });
        var options = new http_1.RequestOptions({ headers: headers });
        this.http.get("/v1/api/engine/restart?name=build", options)
            .toPromise()
            .then(function (res) {
            console.log("Restart build engine successful. res: ", res);
        }).catch(function (err) {
            console.log("Restart build engine errror. err: ", err);
        });
    };
    FlogoConfigComponent.prototype.onResetDefault = function () {
        var _this = this;
        this._configurationService.resetConfiguration()
            .then(function (config) {
            _this.init();
            console.log('Configuration restored');
        });
    };
    FlogoConfigComponent.prototype.getDatabaseName = function (db) {
        db = db || "";
        return db.replace("Database", "");
    };
    FlogoConfigComponent = __decorate([
        core_1.Component({
            selector: 'flogo-config',
            moduleId: module.id,
            directives: [service_status_indicator_component_1.ServiceStatusIndicatorComponent],
            template: "<section class=\"container\">    <header class=\"page-header\">     <h3>Flogo Configuration</h3>     <p>Configurations of Server Information</p>   </header>    <form class=\"form-horizontal\" (ngSubmit)=\"onSave()\">     <div class=\"form-group\">       <div class=\"col-xs-11 col-xs-offset-1\">         <button type=\"submit\" class=\"btn btn-primary\">Save</button>         <button type=\"button\" class=\"btn btn-default\" (click)=\"onCancel()\">Cancel</button>         <button type=\"button\" class=\"btn btn-default\" (click)=\"onResetDefault()\">Reset to default</button>       </div>     </div>      <!-- log link -->     <div class=\"form-group\">       <div class=\"col-xs-11 col-xs-offset-1\">         <a href=\"/test-engine.log\" target=\"_blank\">View Test Engine Log</a>       </div>       <div class=\"col-xs-11 col-xs-offset-1\">         <a href=\"/build-engine.log\" target=\"_blank\">View Build Engine Log</a>       </div>       <div class=\"col-xs-11 col-xs-offset-1\">         <a href=\"/web.log\" target=\"_blank\">View Flogo Web Server Log</a>       </div>       <div class=\"col-xs-11 col-xs-offset-1\">         <button class=\"col-lg-2 col-md-2 col-sm-3\" type=\"button\" class=\"btn btn-default\" (click)=\"onRestartBuild()\">Restart Build engine</button>       </div>     </div>       <!-- server configuration -->      <div class=\"form-group\" *ngIf=\"_servers\">       <label class=\"col-md-2 col-sm-3\">Servers</label>     </div>       <div class=\"form-group\" *ngFor=\"let server of _servers\">       <!-- TODO: replace [innerHTML] with [textContent] https://github.com/angular/angular/issues/8413 -->       <label class=\"col-lg-2 col-md-2 col-sm-3\" [innerHTML]=\"server._label\"></label>       <div class=\"col-lg-8 col-md-8 col-sm-12\">         <div class=\"input-group\">           <input type=\"text\" class=\"form-control\" placeholder=\"{{location.protocol.replace( ':', '' )}}\" [(ngModel)]=\"server.config.protocol\">           <div class=\"input-group-addon\">://</div>           <input type=\"text\" class=\"form-control\" placeholder=\"{{location.hostname}}\" [(ngModel)]=\"server.config.host\">           <div class=\"input-group-addon\">:</div>           <input type=\"text\" class=\"form-control\" placeholder=\"port\" [(ngModel)]=\"server.config.port\">           <div class=\"input-group-addon\">             <flogo-config-service-status-indicator [urlConfig]=\"server.config\"></flogo-config-service-status-indicator>           </div>         </div>       </div>       <button class=\"col-lg-2 col-md-2 col-sm-3\" [ngClass]=\"{'flogo-display': server._display, 'flogo-hide': !server._display}\" style=\"float:left;\" type=\"button\" class=\"btn btn-default\" (click)=\"onRestart(server)\">Restart</button>     </div>      <!-- DB configuration -->      <div class=\"form-group\" *ngIf=\"_appDB || _dbs\">       <hr class=\"col-md-offset-2 col-md-8\" *ngIf=\"_servers\"/>       <label class=\"col-md-2 col-sm-3\">Databases</label>     </div>      <div class=\"form-group\" *ngFor=\"let db of _dbs\">       <!-- TODO: replace [innerHTML] with [textContent] https://github.com/angular/angular/issues/8413 -->       <label class=\"col-md-2 col-sm-3\" [innerHTML]=\"db.config.label\"></label>       <div class=\"col-lg-9 col-md-10 col-sm-12\">         <div class=\"input-group\">           <input type=\"text\" class=\"form-control\" placeholder=\"{{location.protocol.replace( ':', '' )}}\" [(ngModel)]=\"db.config.protocol\">           <div class=\"input-group-addon\">://</div>           <input type=\"text\" class=\"form-control\" placeholder=\"{{location.hostname}}\" [(ngModel)]=\"db.config.host\">           <div class=\"input-group-addon\">:</div>           <input type=\"text\" class=\"form-control\" placeholder=\"port\" [(ngModel)]=\"db.config.port\">           <div class=\"input-group-addon\">/</div>           <input type=\"text\" class=\"form-control\" placeholder=\"dbname\" [(ngModel)]=\"db.config.testPath\">           <div class=\"input-group-addon\">             <flogo-config-service-status-indicator [urlConfig]=\"db.config\"></flogo-config-service-status-indicator>           </div>         </div>       </div>     </div>   </form>   </section>",
            styles: [".input-group-addon:not(:first-child):not(:last-child) {   border-left: none;   border-right: none; } .form-group > label {   font-size: initial;   text-align: right;   line-height: 32px; } .flogo-hide {   visibility: hidden; } .flogo-show {   visibility: visible; }"]
        }),
        router_deprecated_1.CanActivate(function (next) {
            return configurationLoaded_service_1.isConfigurationLoaded();
        }), 
        __metadata('design:paramtypes', [router_deprecated_1.Router, http_1.Http, configuration_service_1.ConfigurationService])
    ], FlogoConfigComponent);
    return FlogoConfigComponent;
}());
exports.FlogoConfigComponent = FlogoConfigComponent;
