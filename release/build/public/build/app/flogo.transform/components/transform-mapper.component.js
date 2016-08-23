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
var transform_mapper_field_component_1 = require('./transform-mapper-field.component');
var TransformMapperComponent = (function () {
    function TransformMapperComponent() {
        this.mappings = '';
        this.tileInputInfo = null;
        this.precedingTilesOutputs = [];
        this.transformationJSON = '';
        this.tileInfo = {
            attributes: {},
            precedingOutputs: {}
        };
        this.mappingChange = new core_1.EventEmitter();
        this.selectedItem = new core_1.EventEmitter();
    }
    TransformMapperComponent.prototype.ngOnChanges = function (changes) {
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
    TransformMapperComponent.prototype.onItemOver = function (params) {
        this.selectedItem.emit(params);
    };
    TransformMapperComponent.prototype.onMappingsChange = function (mappingsChange) {
        var nextValue = mappingsChange.currentValue;
        var currentEditorValue = null;
        try {
            currentEditorValue = this.transformationJSON;
        }
        catch (e) {
        }
        if (!_.isEqual(mappingsChange.previousValue, nextValue) && !_.isEqual(nextValue, currentEditorValue)) {
            var stringified = JSON.stringify(nextValue || [], null, 2);
        }
    };
    TransformMapperComponent.prototype.extractInputs = function (tileInputs) {
        var inputMap = {};
        if (tileInputs) {
            tileInputs.forEach(function (attr) {
                inputMap[attr.name] = attr.type;
            });
        }
        return inputMap;
    };
    TransformMapperComponent.prototype.extractPrecedingOutputs = function (precedingTiles) {
        return precedingTiles ? _.reduce(precedingTiles, function (allOutputNames, tileOutputs, tileName) {
            tileOutputs.forEach(function (output) {
                var path = tileName + "." + output.name;
                allOutputNames[path] = output;
            });
            return allOutputNames;
        }, {}) : {};
    };
    TransformMapperComponent.prototype.onMappingChange = function (event) {
        this.mappingChange.emit(event);
    };
    __decorate([
        core_1.Output(), 
        __metadata('design:type', core_1.EventEmitter)
    ], TransformMapperComponent.prototype, "mappingChange", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], TransformMapperComponent.prototype, "mappings", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], TransformMapperComponent.prototype, "tileInputInfo", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Array)
    ], TransformMapperComponent.prototype, "precedingTilesOutputs", void 0);
    __decorate([
        core_1.Output(), 
        __metadata('design:type', core_1.EventEmitter)
    ], TransformMapperComponent.prototype, "selectedItem", void 0);
    TransformMapperComponent = __decorate([
        core_1.Component({
            selector: 'flogo-transform-mapper',
            directives: [transform_mapper_field_component_1.TransformMapperField],
            moduleId: module.id,
            template: "<div class=\"\">     <div *ngFor=\"let tile of tileInputInfo\">         <flogo-transform-mapper-field                 [tile]=\"tile\"                 [mappings]=\"mappings\"                 [tileInputInfo]=\"tileInputInfo\"                 [tileInfo]=\"tileInfo\"                 (mappingChange)=\"onMappingChange($event)\"                 (itemOver)=\"onItemOver($event)\"                 [precedingTilesOutputs]=\"precedingTilesOutputs\"></flogo-transform-mapper-field>     </div> </div>",
            styles: [""]
        }), 
        __metadata('design:paramtypes', [])
    ], TransformMapperComponent);
    return TransformMapperComponent;
}());
exports.TransformMapperComponent = TransformMapperComponent;
