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
var utils_1 = require('../utils');
var utils_2 = require('../utils');
var FlogoDBService = (function () {
    function FlogoDBService(_ngZone) {
        this._ngZone = _ngZone;
        this.PREFIX_AUTO_GENERATE = 'auto-generate-id';
        this.FLOW = 'flows';
        this.DIAGRAM = 'diagram';
        this.DELIMITER = ":";
        this.DEFAULT_USER_ID = 'flogoweb-admin';
        this._initDB();
        this._ngZone.onError.subscribe(function (err) {
            if (_.isFunction(err && err.error && err.error.promise && err.error.promise.catch)) {
                err.error.promise.catch(function (err) {
                    console.info(err);
                });
            }
        });
    }
    FlogoDBService.prototype._initDB = function () {
        var appDBConfig = window.FLOGO_GLOBAL.db;
        var activitiesDBConfig = window.FLOGO_GLOBAL.activities.db;
        var triggersDBConfig = window.FLOGO_GLOBAL.triggers.db;
        this._activitiesDB = new PouchDB(utils_1.getDBURL(activitiesDBConfig));
        this._activitiesDB.info().then(function (db) {
            console.log('[DB] Activities: ', db);
        }).catch(function (err) {
            console.error(err);
        });
        this._triggersDB = new PouchDB(utils_1.getDBURL(triggersDBConfig));
        this._triggersDB.info().then(function (db) {
            console.log('[DB] Triggers: ', db);
        }).catch(function (err) {
            console.error(err);
        });
        this._db = new PouchDB(utils_1.getDBURL(appDBConfig));
        this._db.info().then(function (db) {
            console.log('[DB] Application: ', db);
        }).catch(function (err) {
            console.error(err);
        });
        return this;
    };
    FlogoDBService.prototype.generateID = function (userID) {
        if (userID === void 0) { userID = undefined; }
        if (!userID) {
            userID = this.DEFAULT_USER_ID;
        }
        var timestamp = new Date().toISOString();
        var random = Math.random();
        var id = "" + this.PREFIX_AUTO_GENERATE + this.DELIMITER + userID + this.DELIMITER + timestamp + this.DELIMITER + random;
        return id;
    };
    FlogoDBService.prototype.generateFlowID = function (userID) {
        if (!userID) {
            userID = this.DEFAULT_USER_ID;
        }
        var timestamp = new Date().toISOString();
        var id = "" + this.FLOW + this.DELIMITER + userID + this.DELIMITER + timestamp;
        console.log("[info]flowID: ", id);
        return id;
    };
    FlogoDBService.prototype.create = function (doc) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            if (!doc)
                reject("Please pass doc");
            if (!doc.$table) {
                console.error("[Error]doc.$table is required. You must pass. ", doc);
                reject("[Error]doc.$table is required.");
            }
            if (!doc._id) {
                doc._id = _this.generateID();
                console.log("[warning]We generate an id for you, but suggest you give a meaningful id to this document.");
            }
            if (!doc['created_at']) {
                doc['created_at'] = new Date().toISOString();
            }
            _this._db.put(doc).then(function (response) {
                console.log("response: ", response);
                resolve(response);
            }).catch(function (err) {
                console.error(err);
                reject(err);
            });
        });
    };
    FlogoDBService.prototype.update = function (doc) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            if (!doc)
                reject("Please pass doc");
            if (!doc._id) {
                console.error("[Error] Your doc don't have a valid _id");
                reject("[Error] Your doc don't have a valid _id");
            }
            if (!doc._rev) {
                console.error("[Error] Your doc don't have valid _rev");
                reject("[Error] Your doc don't have valid _rev");
            }
            if (!doc.$table) {
                console.error("[Error]doc.$table is required. You must pass. ", doc);
                reject("[Error]doc.$table is required.");
            }
            if (!doc['updated_at']) {
                doc['updated_at'] = new Date().toISOString();
            }
            _this._db.get(doc._id).then(function (dbDoc) {
                doc = _.cloneDeep(doc);
                delete doc['_rev'];
                _.assign(dbDoc, doc);
                return _this._db.put(dbDoc).then(function (response) {
                    console.log("response: ", response);
                    resolve(response);
                }).catch(function (err) {
                    console.error(err);
                    reject(err);
                });
            });
        });
    };
    FlogoDBService.prototype.allDocs = function (options) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this._db.allDocs(options).then(function (response) {
                console.log("[allDocs]response: ", response);
                resolve(response);
            }).catch(function (err) {
                console.error(err);
                reject(err);
            });
        });
    };
    FlogoDBService.prototype.remove = function () {
        var _this = this;
        var parameters = arguments;
        return new Promise(function (resolve, reject) {
            var doc, docId, docRev;
            if (parameters.length == 1) {
                doc = parameters[0];
                if (typeof doc != "object") {
                    console.error("[error]Please pass correct doc object");
                    reject("[error]Please pass correct doc object");
                }
                _this._db.remove(doc).then(function (response) {
                    resolve(response);
                }).catch(function (err) {
                    reject(err);
                });
            }
            else if (parameters.length > 1) {
                docId = parameters[0];
                docRev = parameters[1];
                if (!docId || !docRev) {
                    console.error("[error]Please pass correct doc._id and doc._rev");
                    reject("[error]Please pass correct doc._id and doc._rev");
                }
                _this._db.remove(docId, docRev).then(function (response) {
                    resolve(response);
                }).catch(function (err) {
                    reject(err);
                });
            }
        });
    };
    FlogoDBService.prototype.getFlow = function (id) {
        return this._db.get(id);
    };
    FlogoDBService.prototype.getAllActivities = function () {
        return this.getActivities(Infinity);
    };
    FlogoDBService.prototype.getActivities = function (limit) {
        var _this = this;
        if (limit === void 0) { limit = 200; }
        var activitiesDBConfig = window.FLOGO_GLOBAL.activities.db;
        return PouchDB.sync(activitiesDBConfig.name + "-local", utils_1.getDBURL(activitiesDBConfig), {
            live: false,
            retry: true
        })
            .then(function () {
            return _this._activitiesDB.allDocs({
                include_docs: true,
                limit: limit
            })
                .then(function (docs) {
                return _.map(_.filter(docs.rows, function (doc) { return !_.isEmpty(_.get(doc, 'doc.schema', '')); }), function (doc) {
                    return utils_1.activitySchemaToTask(doc.doc.schema);
                });
            });
        })
            .catch(function (err) {
            console.log(err);
            return err;
        });
    };
    FlogoDBService.prototype.getInstallableActivities = function () {
        return Promise.resolve([]);
    };
    FlogoDBService.prototype.getAllTriggers = function () {
        return this.getTriggers();
    };
    FlogoDBService.prototype.getTriggers = function (limit) {
        var _this = this;
        if (limit === void 0) { limit = 200; }
        var triggersDBConfig = window.FLOGO_GLOBAL.triggers.db;
        return PouchDB.sync(triggersDBConfig.name + "-local", utils_1.getDBURL(triggersDBConfig), {
            live: false,
            retry: true
        })
            .then(function () {
            return _this._triggersDB.allDocs({
                include_docs: true,
                limit: limit
            })
                .then(function (docs) {
                return _.map(_.filter(docs.rows, function (doc) { return !_.isEmpty(_.get(doc, 'doc.schema', '')); }), function (doc) {
                    return utils_2.activitySchemaToTrigger(doc.doc.schema);
                });
            });
        })
            .catch(function (err) {
            console.log(err);
            return err;
        });
    };
    FlogoDBService = __decorate([
        core_1.Injectable(), 
        __metadata('design:paramtypes', [core_1.NgZone])
    ], FlogoDBService);
    return FlogoDBService;
}());
exports.FlogoDBService = FlogoDBService;
