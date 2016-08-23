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
var TransformJsonPanelComponent = (function () {
    function TransformJsonPanelComponent() {
        this.schema = {};
        this.name = '';
        this.isInput = false;
        this.currentFieldSelected = {};
        this.isCollapsed = true;
        this.currentSchema = '';
        this.toggledControl = new core_1.EventEmitter();
    }
    TransformJsonPanelComponent.prototype.ngOnInit = function () {
        if (this.isInput) {
            this.currentSchema = this.getFormattedHTMLInput(this.schema, '');
        }
        else {
            this.currentSchema = this.getFormattedHTMLOutput(this.schema, '', '');
        }
    };
    TransformJsonPanelComponent.prototype.ngOnChanges = function (changes) {
        if (_.has(changes, 'currentFieldSelected')) {
            var itemSelected = changes.currentFieldSelected.currentValue;
            if (!_.isEmpty(itemSelected)) {
                if (this.isInput) {
                    if (itemSelected.tile) {
                        itemSelected.name = '';
                    }
                    this.currentSchema = this.getFormattedHTMLInput(this.schema, itemSelected.name || '');
                }
                else {
                    this.currentSchema = this.getFormattedHTMLOutput(this.schema, itemSelected.tile || '', itemSelected.name || '');
                }
            }
        }
    };
    TransformJsonPanelComponent.prototype.togglePanel = function () {
        this.isCollapsed = !this.isCollapsed;
        this.toggledControl.emit({
            isInput: this.isInput,
            isCollapsed: this.isCollapsed
        });
        if (!this.isCollapsed) {
            if (this.isInput) {
                this.currentSchema = this.getFormattedHTMLInput(this.schema, '');
            }
            else {
                this.currentSchema = this.getFormattedHTMLOutput(this.schema, '', '');
            }
        }
    };
    TransformJsonPanelComponent.prototype.wrapInDiv = function (value, isSelected, leftMargin) {
        var html = '';
        html += "<div class=\"ft-json__selected\"";
        html += ' style="';
        if (isSelected) {
            html += 'font-weight:bold;';
        }
        if (leftMargin) {
            html += 'margin-left:' + leftMargin + ';';
        }
        html += '"';
        html += ">" + value + "</div>";
        return html;
    };
    TransformJsonPanelComponent.prototype.getFormattedHTMLInput = function (jsonSchema, fieldSelected) {
        var _this = this;
        var html = '';
        html += this.wrapInDiv('[', false, '-15px');
        var fieldCount = 1;
        jsonSchema.forEach(function (item) {
            var isSelected = false;
            var coma = '';
            if (fieldCount < jsonSchema.length) {
                coma = ',';
            }
            if (fieldSelected == item.name) {
                isSelected = true;
            }
            html += _this.wrapInDiv("{", isSelected, '10px');
            html += _this.wrapInDiv("\"name\":\"" + item.name + "\"", isSelected, '20px');
            html += _this.wrapInDiv("\"type\":\"" + item.type + "\"", isSelected, '20px');
            html += _this.wrapInDiv("}" + coma, isSelected, '10px');
            fieldCount += 1;
        });
        html += this.wrapInDiv(']', false, '-15px');
        return html;
    };
    TransformJsonPanelComponent.prototype.getFormattedHTMLOutput = function (jsonSchema, tileSelected, fieldSelected) {
        var html = '';
        var isSelected = false;
        html += this.wrapInDiv('{', false, '-10px');
        for (var tile in jsonSchema) {
            if (jsonSchema[tile] instanceof Array) {
                html += this.wrapInDiv("\"" + tile + "\":[", false, '');
                var countField = 1;
                for (var fieldIndex in jsonSchema[tile]) {
                    html += this.wrapInDiv('{', false, '5px');
                    isSelected = (tile == tileSelected && jsonSchema[tile][fieldIndex]['name'] == fieldSelected);
                    for (var field in jsonSchema[tile][fieldIndex]) {
                        html += this.wrapInDiv("\"" + field + "\":\"" + jsonSchema[tile][fieldIndex][field] + "\"", isSelected, '10px');
                    }
                    if (countField < jsonSchema[tile].length) {
                        html += this.wrapInDiv('},', false, '5px');
                    }
                    else {
                        html += this.wrapInDiv('}', false, '5px');
                    }
                    countField += 1;
                }
                html += this.wrapInDiv(']', false, '');
            }
        }
        html += this.wrapInDiv('}', false, '-15px');
        return html;
    };
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], TransformJsonPanelComponent.prototype, "schema", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', String)
    ], TransformJsonPanelComponent.prototype, "name", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Boolean)
    ], TransformJsonPanelComponent.prototype, "isInput", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], TransformJsonPanelComponent.prototype, "currentFieldSelected", void 0);
    TransformJsonPanelComponent = __decorate([
        core_1.Component({
            selector: 'flogo-transform-json-panel',
            moduleId: module.id,
            template: "<div class=\"flogo-transformation-json\">     <div class=\"flogo-transformation-json__header\">          <div *ngIf=\"isInput\" class=\"flogo-transformation-json__header--input\">             <div [ngClass]=\"{'flogo-transformation-json__header--collapsed':isCollapsed,'flogo-transformation-json__header--not-collapsed':!isCollapsed}\">                 <div class=\"flogo-transformation-json__header__label\">Input</div>                 <div class=\"flogo-transformation-json__header__icon\" (click)=\"togglePanel()\" *ngIf=\"isCollapsed\"><img src=\"/assets/svg/arrow-left.svg\" alt=\"\"></div>                 <div class=\"flogo-transformation-json__header__icon\" (click)=\"togglePanel()\" *ngIf=\"!isCollapsed\"><img src=\"/assets/svg/arrow-right.svg\" alt=\"\"></div>             </div>           </div>           <div *ngIf=\"!isInput\" class=\"flogo-transformation-json__header--output\">             <div [ngClass]=\"{'flogo-transformation-json__header--collapsed':isCollapsed,'flogo-transformation-json__header--not-collapsed':!isCollapsed}\">                 <div class=\"flogo-transformation-json__header__label\">Output</div>                 <div class=\"flogo-transformation-json__header__icon\" (click)=\"togglePanel()\" *ngIf=\"isCollapsed\"><img src=\"/assets/svg/arrow-right.svg\" alt=\"\"></div>                 <div class=\"flogo-transformation-json__header__icon\" (click)=\"togglePanel()\" *ngIf=\"!isCollapsed\"><img src=\"/assets/svg/arrow-left.svg\" alt=\"\"></div>             </div>         </div>      </div>      <div *ngIf=\"!isCollapsed\">         <hr />          <div  *ngIf=\"!isInput\">             <div class=\"flogo-transformation-json__header__subtitle\">Previous tiles</div>         </div>          <div  *ngIf=\"isInput\">             <div class=\"flogo-transformation-json__header__subtitle\">Transformation for {{name}} </div>         </div>      </div>      <div *ngIf=\"!isCollapsed\" [innerHTML]=\"currentSchema\" class=\"flogo-transformation-json__code\"></div> </div>",
            outputs: ['toggledControl:toggled'],
            styles: [".flogo-transformation-json .flogo-transformation-json__header .flogo-transformation-json__header--collapsed, .flogo-transformation-json .flogo-transformation-json__header .flogo-transformation-json__header--not-collapsed {   display: flex; } .flogo-transformation-json .flogo-transformation-json__header .flogo-transformation-json__header--collapsed {   flex-direction: column;   align-items: center; } .flogo-transformation-json .flogo-transformation-json__header .flogo-transformation-json__header--not-collapsed {   flex-direction: row;   justify-content: space-between; } .flogo-transformation-json .flogo-transformation-json__header .flogo-transformation-json__header--input .flogo-transformation-json__header--not-collapsed .flogo-transformation-json__header__label {   order: 2; } .flogo-transformation-json .flogo-transformation-json__header .flogo-transformation-json__header--input .flogo-transformation-json__header--not-collapsed .flogo-transformation-json__header__icon {   order: 1; } .flogo-transformation-json .flogo-transformation-json__header .flogo-transformation-json__header--output .flogo-transformation-json__header--not-collapsed .flogo-transformation-json__header__label {   order: 1; } .flogo-transformation-json .flogo-transformation-json__header .flogo-transformation-json__header--output .flogo-transformation-json__header--not-collapsed .flogo-transformation-json__header__icon {   order: 2; } .flogo-transformation-json .flogo-transformation-json__header .flogo-transformation-json__header__icon {   cursor: pointer; } .flogo-transformation-json .flogo-transformation-json__header__subtitle {   font-weight: bold; } .flogo-transformation-json .flogo-transformation-json__code {   background-color: #FFF;   border: none;   border-radius: 4px;   color: #666;   padding: 19px 24px;   margin: 0;   overflow: auto;   flex: 1;   max-width: 210px; }"]
        }), 
        __metadata('design:paramtypes', [])
    ], TransformJsonPanelComponent);
    return TransformJsonPanelComponent;
}());
exports.TransformJsonPanelComponent = TransformJsonPanelComponent;
