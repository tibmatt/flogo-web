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
var common_1 = require('@angular/common');
var validators_1 = require('../validators/validators');
var MapEditorComponent = (function () {
    function MapEditorComponent() {
        var _this = this;
        this.mappings = '';
        this.tileInputInfo = null;
        this.precedingTilesOutputs = [];
        this.tileInfo = {
            attributes: {},
            precedingOutputs: {}
        };
        this.mappingChange = new core_1.EventEmitter();
        var mappingsValidator = validators_1.mappingsValidatorFactory(this.tileInfo);
        this.editor = new common_1.Control('', common_1.Validators.compose([common_1.Validators.required, validators_1.jsonValidator, mappingsValidator]));
        this
            .editor
            .valueChanges
            .debounceTime(300)
            .distinctUntilChanged()
            .map(function (rawVal) {
            return {
                isValid: _this.editor.valid,
                isDirty: _this.editor.dirty,
                errors: _this.editor.errors,
                value: _this.editor.valid ? JSON.parse(rawVal) : null
            };
        })
            .distinctUntilChanged(function (prev, next) { return _.isEqual(prev, next); })
            .do(function (val) {
            console.group('emitted val');
            console.log(val);
            console.groupEnd();
        })
            .subscribe(function (val) { return _this.mappingChange.emit(val); });
    }
    MapEditorComponent.prototype.ngOnInit = function () {
    };
    MapEditorComponent.prototype.ngOnChanges = function (changes) {
        if (changes.mappings) {
            this.onMappingsChange(changes.mappings);
        }
        if (changes.tileInputInfo && this.tileInputInfo) {
            this.tileInfo.attributes = this.extractInputs(this.tileInputInfo);
        }
        if (changes.precedingTilesOutputs && this.precedingTilesOutputs) {
            this.tileInfo.precedingOutputs = this.extractPrecedingOutputs(this.precedingTilesOutputs);
        }
    };
    MapEditorComponent.prototype.onMappingsChange = function (mappingsChange) {
        var nextValue = mappingsChange.currentValue;
        var currentEditorValue = null;
        try {
            currentEditorValue = JSON.parse(this.editor.value);
        }
        catch (e) {
        }
        if (!_.isEqual(mappingsChange.previousValue, nextValue) && !_.isEqual(nextValue, currentEditorValue)) {
            var stringified = JSON.stringify(nextValue || [], null, 2);
            this.editor.updateValue(stringified, { onlySelf: true, emitEvent: false });
        }
    };
    MapEditorComponent.prototype.extractInputs = function (tileInputs) {
        var inputMap = {};
        if (tileInputs) {
            tileInputs.forEach(function (attr) {
                inputMap[attr.name] = attr.type;
            });
        }
        return inputMap;
    };
    MapEditorComponent.prototype.extractPrecedingOutputs = function (precedingTiles) {
        return precedingTiles ? _.reduce(precedingTiles, function (allOutputNames, tileOutputs, tileName) {
            tileOutputs.forEach(function (output) {
                var path = tileName + "." + output.name;
                allOutputNames[path] = output;
            });
            return allOutputNames;
        }, {}) : {};
    };
    __decorate([
        core_1.Output(), 
        __metadata('design:type', core_1.EventEmitter)
    ], MapEditorComponent.prototype, "mappingChange", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], MapEditorComponent.prototype, "mappings", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], MapEditorComponent.prototype, "tileInputInfo", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Array)
    ], MapEditorComponent.prototype, "precedingTilesOutputs", void 0);
    MapEditorComponent = __decorate([
        core_1.Component({
            selector: 'flogo-transform-map-editor',
            directives: [common_1.FORM_DIRECTIVES],
            moduleId: module.id,
            styles: [":host {   display: flex;   flex: 1;   flex-direction: column; } .editor {   flex: 1;   height: 100%;   resize: none; } .ng-valid {   border: 2px solid #a5d377; }"],
            template: "<textarea class=\"form-control tc-text-areas tc-text-area editor\"           cols=\"30\" [ngFormControl]=\"editor\" rows=\"12\"></textarea>"
        }), 
        __metadata('design:paramtypes', [])
    ], MapEditorComponent);
    return MapEditorComponent;
}());
exports.MapEditorComponent = MapEditorComponent;
