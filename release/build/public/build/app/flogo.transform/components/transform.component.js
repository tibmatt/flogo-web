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
var post_service_1 = require('../../../common/services/post.service');
var constants_1 = require('../../../common/constants');
var constants_2 = require('../constants');
var messages_1 = require('../messages');
var map_editor_component_1 = require('./map-editor.component');
var visual_mapper_component_1 = require('./visual-mapper.component');
var error_display_component_1 = require('./error-display.component');
var help_component_1 = require("./help.component");
var transform_mapper_component_1 = require('./transform-mapper.component');
var transform_json_panel_component_1 = require('./transform-json-panel.component');
var utils_1 = require('../../../common/utils');
var TILE_MAP_ROOT_KEY = 'root-task';
var TransformComponent = (function () {
    function TransformComponent(_postService) {
        this._postService = _postService;
        this.fieldsConnections = [];
        this.isCollapsedOutput = true;
        this.isCollapsedInput = true;
        this.currentFieldSelected = {};
        this.active = false;
        this.out = false;
        this.showDeleteConfirmation = false;
        this.data = {
            result: null,
            precedingTiles: [],
            precedingTilesOutputs: [],
            tile: null,
            tileInputInfo: null,
            mappings: null
        };
        this.initSubscriptions();
        this.resetState();
    }
    TransformComponent.prototype.ngOnDestroy = function () {
        this.cancelSubscriptions();
    };
    TransformComponent.prototype.onSelectedItem = function (params) {
        this.currentFieldSelected = params;
    };
    TransformComponent.prototype.removeError = function (change) {
        this.errors = this.errors || { invalidMappings: { errors: [] } };
        var index = this.errors.invalidMappings.errors.findIndex(function (item) {
            return item.value.mapTo == change.field;
        });
        if (index !== -1) {
            this.errors.invalidMappings.errors.splice(index, 1);
        }
        if (this.errors.invalidMappings.errors.length == 0) {
            this.errors = null;
        }
    };
    TransformComponent.prototype.onToggledSchema = function (state) {
        if (state.isInput) {
            this.isCollapsedInput = state.isCollapsed;
        }
        else {
            this.isCollapsedOutput = state.isCollapsed;
        }
    };
    TransformComponent.prototype.updateErrors = function (change) {
        var currentError = change.errors.invalidMappings.errors[0];
        this.errors = this.errors || { invalidMappings: { errors: [] } };
        if (change.errors.invalidMappings && change.errors.invalidMappings.errors) {
            var index = this.errors.invalidMappings.errors.findIndex(function (item) {
                return item.value.mapTo == change.field;
            });
            if (index == -1) {
                this.errors.invalidMappings.errors.push(currentError);
            }
            else {
                this.errors.invalidMappings.errors[index] = currentError;
            }
        }
    };
    TransformComponent.prototype.onMappingsChange = function (change) {
        if (change.hasError) {
            this.updateErrors(change);
        }
        else {
            this.removeError(change);
        }
        this.fieldsConnections[change.field] = { value: change.value, mapTo: change.field, hasError: change.hasError };
        this.isValid = this.checkIsValid();
        this.isDirty = true;
        if (this.isValid) {
            this.data.result = this.getResult();
        }
    };
    TransformComponent.prototype.getResult = function () {
        var results = [];
        for (var key in this.fieldsConnections) {
            if (this.fieldsConnections.hasOwnProperty(key)) {
                if (!this.fieldsConnections[key].hasError && this.fieldsConnections[key].value) {
                    results.push({
                        type: 1,
                        mapTo: this.fieldsConnections[key].mapTo,
                        value: this.fieldsConnections[key].value
                    });
                }
            }
        }
        return results;
    };
    TransformComponent.prototype.checkIsValid = function () {
        var hasNonEmpty = false;
        for (var key in this.fieldsConnections) {
            if (this.fieldsConnections.hasOwnProperty(key)) {
                if (this.fieldsConnections[key].hasError) {
                    return false;
                }
                if (this.fieldsConnections[key].value) {
                    hasNonEmpty = true;
                }
            }
        }
        return hasNonEmpty;
    };
    TransformComponent.prototype.saveTransform = function () {
        this._postService.publish(_.assign({}, messages_1.PUB_EVENTS.saveTransform, {
            data: {
                tile: this.data.tile,
                inputMappings: this.transformMappingsToExternalFormat(this.data.result)
            }
        }));
        this.close();
    };
    TransformComponent.prototype.deleteTransform = function () {
        this._postService.publish(_.assign({}, messages_1.PUB_EVENTS.deleteTransform, {
            data: {
                tile: this.data.tile
            }
        }));
        this.close();
    };
    TransformComponent.prototype.cancel = function () {
        this.close();
    };
    TransformComponent.prototype.openDeleteConfirmation = function (event) {
        this.showDeleteConfirmation = true;
        event.stopPropagation();
    };
    TransformComponent.prototype.cancelDeleteConfirmation = function () {
        this.showDeleteConfirmation = false;
    };
    TransformComponent.prototype.clickOutsideDeleteConfirmation = function (event) {
        if (this.showDeleteConfirmation && this.deleteContainer && !this.deleteContainer.nativeElement.contains(event.target)) {
            this.showDeleteConfirmation = false;
        }
    };
    TransformComponent.prototype.initSubscriptions = function () {
        var _this = this;
        var subHandlers = [
            _.assign({}, messages_1.SUB_EVENTS.selectActivity, { callback: this.onTransformSelected.bind(this) })
        ];
        this._subscriptions = subHandlers.map(function (handler) { return _this._postService.subscribe(handler); });
    };
    TransformComponent.prototype.cancelSubscriptions = function () {
        if (_.isEmpty(this._subscriptions)) {
            return true;
        }
        this._subscriptions.forEach(this._postService.unsubscribe);
        return true;
    };
    TransformComponent.prototype.onTransformSelected = function (data, envelope) {
        this.data = {
            result: null,
            precedingTiles: data.previousTiles,
            precedingTilesOutputs: this.extractPrecedingTilesOutputs(data.previousTiles),
            tile: data.tile,
            tileInputInfo: this.extractTileInputInfo(data.tile || {}),
            mappings: data.tile.inputMappings ? _.cloneDeep(data.tile.inputMappings) : []
        };
        this.data.mappings = this.transformMappingsToInternalFormat(this.data.mappings);
        this.resetState();
        this.open();
    };
    TransformComponent.prototype.extractPrecedingTilesOutputs = function (precedingTiles) {
        var _this = this;
        return _.chain(precedingTiles || [])
            .filter(function (tile) {
            var attrHolder = tile.type == constants_1.FLOGO_TASK_TYPE.TASK_ROOT ? tile : tile.attributes;
            return attrHolder && attrHolder.outputs && attrHolder.outputs.length > 0;
        })
            .map(function (tile) {
            var name = utils_1.normalizeTaskName(tile.name);
            var attrHolder = tile.type == constants_1.FLOGO_TASK_TYPE.TASK_ROOT ? tile : tile.attributes;
            var outputs = attrHolder.outputs.map(_this.mapInOutObjectDisplay);
            return [name, outputs];
        })
            .fromPairs()
            .value();
    };
    TransformComponent.prototype.extractTileInputInfo = function (tile) {
        return (tile.attributes && tile.attributes.inputs) ? tile.attributes.inputs.map(this.mapInOutObjectDisplay) : [];
    };
    TransformComponent.prototype.mapInOutObjectDisplay = function (inputOutput) {
        var attributeType = constants_1.FLOGO_TASK_ATTRIBUTE_TYPE[inputOutput.type];
        if (!attributeType) {
            attributeType = (inputOutput.type || '');
            console.warn("WARN! Unknown type: " + inputOutput.type);
        }
        return {
            name: inputOutput.name,
            type: attributeType.toLowerCase()
        };
    };
    TransformComponent.prototype.transformMappingsToExternalFormat = function (mappings) {
        var tileMap = {};
        _.forEach(this.data.precedingTiles, function (tile) {
            tileMap[utils_1.normalizeTaskName(tile.name)] = {
                id: utils_1.convertTaskID(tile.id),
                isRoot: tile.type == constants_1.FLOGO_TASK_TYPE.TASK_ROOT
            };
        });
        var re = constants_2.REGEX_INPUT_VALUE_INTERNAL;
        mappings.forEach(function (mapping) {
            var matches = re.exec(mapping.value);
            if (!matches) {
                return;
            }
            var taskInfo = tileMap[matches[2]];
            var property = matches[3];
            var path = taskInfo.isRoot ? "T." + property : "A" + taskInfo.id + "." + property;
            var rest = matches[4] || '';
            mapping.value = "{" + path + "}" + rest;
        });
        return mappings;
    };
    TransformComponent.prototype.transformMappingsToInternalFormat = function (mappings) {
        var tileMap = {};
        _.forEach(this.data.precedingTiles, function (tile) {
            var tileId = utils_1.convertTaskID(tile.id) || undefined;
            tileMap[tileId] = utils_1.normalizeTaskName(tile.name);
            if (tile.type == constants_1.FLOGO_TASK_TYPE.TASK_ROOT) {
                tileMap[TILE_MAP_ROOT_KEY] = tileMap[tileId];
            }
        });
        var re = constants_2.REGEX_INPUT_VALUE_EXTERNAL;
        mappings.forEach(function (mapping) {
            var matches = re.exec(mapping.value);
            if (!matches) {
                return;
            }
            var taskName = tileMap[matches[2]] || tileMap[TILE_MAP_ROOT_KEY];
            var property = matches[3];
            var rest = matches[4] || '';
            mapping.value = taskName + "." + property + rest;
        });
        return mappings;
    };
    TransformComponent.prototype.resetState = function () {
        this.isValid = true;
        this.isDirty = false;
        this.errors = null;
        this.showDeleteConfirmation = false;
    };
    TransformComponent.prototype.open = function () {
        var _this = this;
        this.out = false;
        setTimeout(function () { return _this.active = true; }, 0);
    };
    TransformComponent.prototype.close = function () {
        var _this = this;
        this.out = true;
        setTimeout(function () { return _this.active = _this.out = false; }, 400);
    };
    __decorate([
        core_1.ViewChild('deleteContainer'), 
        __metadata('design:type', core_1.ElementRef)
    ], TransformComponent.prototype, "deleteContainer", void 0);
    __decorate([
        core_1.HostListener('click', ['$event']), 
        __metadata('design:type', Function), 
        __metadata('design:paramtypes', [Event]), 
        __metadata('design:returntype', void 0)
    ], TransformComponent.prototype, "clickOutsideDeleteConfirmation", null);
    TransformComponent = __decorate([
        core_1.Component({
            selector: 'flogo-transform',
            directives: [map_editor_component_1.MapEditorComponent, error_display_component_1.ErrorDisplayComponent, help_component_1.HelpComponent, visual_mapper_component_1.VisualMapperComponent, transform_mapper_component_1.TransformMapperComponent, transform_json_panel_component_1.TransformJsonPanelComponent],
            moduleId: module.id,
            styles: [".flogo-transform-modal-wrapper {   background-color: #fff;   position: fixed;   top: 0;   right: 0;   left: 0;   bottom: 0;   z-index: 999;   -webkit-transition: -webkit-transform 0.3s ease-out, opacity 0.3s ease;   -moz-transition: -moz-transform 0.3s ease-out, opacity 0.3s ease;   -o-transition: -o-transform 0.3s ease-out, opacity 0.3s ease;   transition: transform 0.3s ease-out, opacity 0.3s ease;   -webkit-transform: translateY(-100%);   -ms-transform: translateY(-100%);   /* IE9+ */   transform: translateY(-100%);   opacity: 0; } .flogo-transform-modal-wrapper.in {   -webkit-transform: translateY(0%);   -ms-transform: translateY(0%);   /* IE9+ */   transform: translateY(0%);   opacity: 1; } .flogo-transform-modal {   display: flex;   flex-direction: column;   padding: 39px 70px;   height: 100%;   width: 100%; } .flogo-transform-modal__header {   border-bottom: 1px solid #d8d8d8;   height: 61px;   margin-bottom: 25px;   padding-bottom: 16px;   position: relative;   z-index: 0; } .flogo-transform-modal__header-title {   background: url('/assets/svg/flogo.transform.icon.svg') no-repeat left center;   color: #666;   font-size: 24px;   margin: 0;   padding: 0 0 0 30px; } .flogo-transform-modal__close {   background: url('/assets/svg/flogo.close.svg') no-repeat center center;   border: none;   position: absolute;   height: 19px;   right: -40px;   top: -20px;   width: 19px; } .flogo-transform-modal__content {   display: flex;   flex: 1;   justify-content: space-between; } .flogo-transform-modal__content .col {   display: flex;   flex-direction: column;   background-color: #eceff4; } .flogo-transform-modal__content .col .flogo-transform-modal__content-json-panel {   height: 100%;   overflow: auto;   background-color: #FFF; } .flogo-transform-modal__content .collapsed {   flex: 0 0 8%; } .flogo-transform-modal__content .not-collapsed {   flex: 0 0 16%; } .flogo-transform-modal__col-header {   font-size: 15px;   margin-bottom: 17px; } .flogo-transform-modal__col-header-title {   line-height: 1.2;   padding-top: 20px; } .flogo-transform-modal__col-header-subtitle {   color: #aaa;   font-size: 13px;   line-height: 1.4; } .flogo-transform-modal__col-header-subtitle + .flogo-transform-modal__col-header-title {   padding-top: 2px; } .flogo-transform-modal__schema-display {   background-color: #eceff4;   border: none;   border-radius: 4px;   color: #666;   padding: 19px 24px;   margin: 0;   overflow: auto;   flex: 1; } .editor-col .flogo-transform-modal__col-content {   display: flex;   flex-direction: column; } .flogo-transform-modal__editor-container {   display: flex;   flex-direction: column;   flex: 1;   flex-shrink: 0;   height: 35%;   min-height: 35%; } .flogo-transform-modal__error-container {   display: flex;   flex: 1;   flex-direction: column;   height: 25%;   max-height: 25%;   padding-top: 20px; } .flogo-transform-delete-btn {   background: url('/assets/svg/flogo.transform.trash.icon.svg') no-repeat 13px center;   color: #0081cb; } .flogo-transform-delete-btn:hover {   -webkit-filter: brightness(140%) saturate(60%);   filter: brightness(140%) saturate(60%); } .flogo-transform-delete-btn:active {   -webkit-filter: brightness(80%) saturate(80%);   filter: brightness(80%) saturate(80%); } .flogo-transform-header {   background-color: #fff;   padding-bottom: 15px;   width: 100%; } .flogo-transform-confirm-delete {   color: #fff;   background-color: #0081cb;   font-size: 16px;   line-height: 45px;   right: 0;   position: absolute;   top: 0;   text-align: right;   width: 100%;   z-index: 2;   pointer-events: none;   transition: all 0.2s ease-out;   transform: translateX(100%); } .flogo-transform-confirm-delete .text {   padding-left: 16px;   padding-right: 20px; } .is-delete-open .flogo-transform-confirm-delete {   pointer-events: auto;   transform: translateX(0%); } .delete-btn {   background-color: transparent;   border: none;   height: 45px;   line-height: 1;   min-width: 89px; } .delete-btn:focus {   outline: none; } .delete-btn:hover, .delete-btn:active {   background-color: #fff;   color: #0081cb; } .flogo-transform-header__main-actions {   min-width: 320px;   overflow: hidden;   position: relative;   text-align: right; } .editor-col {   width: 40%; } .mappings-container {   display: flex;   flex-direction: column;   flex: 0.9 0.9;   align-items: center; } .mappings-container__header {   flex: 0 0 7%; } .mappings-container__main {   flex: 0 0 63%;   overflow: auto; } .mappings-container__error {   flex: 0 0 30%;   margin-top: 10px;   overflow: auto; }"],
            template: "<div class=\"flogo-transform-modal-wrapper\" [ngClass]=\"{'in':active && !out}\">   <div *ngIf=\"active\" class=\"flogo-transform-modal\">     <div class=\"flogo-transform-modal__header\" [class.is-delete-open]=\"showDeleteConfirmation\">       <div class=\"flogo-transform-header\">         <div class=\"flogo-transform-header__title\">           <h2 class=\"flogo-transform-modal__header-title\">Transformation</h2>         </div>         <div class=\"flogo-transform-header__main-actions\">           <button class=\"flogo-btn-link flogo-transform-delete-btn\" (click)=\"openDeleteConfirmation($event)\">             Delete           </button>           <button class=\"tc-buttons tc-buttons-primary flogo-transform-save-btn\"                   [class.disabled]=\"!isValid || !isDirty\" [disabled]=\"!isValid || !isDirty\"                   (click)=\"saveTransform()\">Save           </button>           <div class=\"flogo-transform-confirm-delete\" #deleteContainer>             <span class=\"text\">Are you sure?</span>             <button class=\"delete-btn\" (click)=\"deleteTransform()\">Yes</button>             <button class=\"delete-btn\" (click)=\"cancelDeleteConfirmation()\">No</button>           </div>         </div>         <button class=\"flogo-transform-modal__close\" (click)=\"cancel()\">           <span aria-hidden=\"true\" class=\"sr-only\">Close</span>         </button>       </div>     </div>      <div class=\"flogo-transform-modal__content\">        <div class=\"col\" [ngClass]=\"{'collapsed':isCollapsedOutput, 'not-collapsed':!isCollapsedOutput}\"   >         <flogo-transform-json-panel                 class=\"flogo-transform-modal__content-json-panel\"                 [schema]=\"data.precedingTilesOutputs\"                 [currentFieldSelected]=\"currentFieldSelected\"                 (toggled)=\"onToggledSchema($event)\"                 [isInput]=\"false\"></flogo-transform-json-panel>       </div>        <div class=\"mappings-container\" [class.has-error]=\"!isValid\">         <div class=\"mappings-container__main\">             <flogo-transform-mapper [mappings]=\"data.mappings\"                                     [tileInputInfo]=\"data.tileInputInfo\"                                     [precedingTilesOutputs]=\"data.precedingTilesOutputs\"                                     (selectedItem)=\"onSelectedItem($event)\"                                     (mappingChange)=\"onMappingsChange($event)\"></flogo-transform-mapper>         </div>         <div class=\"mappings-container__error\" [hidden]=\"!errors\">           <flogo-transform-error-display [errors]=\"errors\"></flogo-transform-error-display>         </div>       </div>         <div class=\"col\" [ngClass]=\"{'collapsed':isCollapsedInput, 'not-collapsed':!isCollapsedInput}\"  >         <flogo-transform-json-panel [schema]=\"data.tileInputInfo\"                           class=\"flogo-transform-modal__content-json-panel\"                           [isInput]=\"true\"                           [currentFieldSelected]=\"currentFieldSelected\"                           (toggled)=\"onToggledSchema($event)\"                           [name]=\"data.tile?.name\"></flogo-transform-json-panel>       </div>        </div>   </div>    </div>",
        }), 
        __metadata('design:paramtypes', [post_service_1.PostService])
    ], TransformComponent);
    return TransformComponent;
}());
exports.TransformComponent = TransformComponent;