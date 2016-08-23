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
var VisualMapperComponent = (function () {
    function VisualMapperComponent() {
        this.mappings = '';
        this.precedingTilesOutputs = [];
        this.outputs = [];
        this.showList = false;
        this.selectedValue = '';
        this.showList = false;
        this.mappingChange = new core_1.EventEmitter();
    }
    VisualMapperComponent.prototype.precedingTilesToArray = function (precedingTiles) {
        var tiles = [];
        for (var tileName in precedingTiles || {}) {
            var tile = { name: tileName, fields: precedingTiles[tileName] };
            tiles.push(tile);
        }
        return tiles;
    };
    VisualMapperComponent.prototype.focusInputText = function () {
        this.showList = true;
    };
    VisualMapperComponent.prototype.onKeyPress = function (event) {
        if (event.keyCode == 27) {
            this.showList = false;
        }
    };
    VisualMapperComponent.prototype.clickField = function (output, field) {
        this.selectedValue = output.name + '.' + field.name;
        this.showList = false;
    };
    VisualMapperComponent.prototype.ngOnChanges = function (changes) {
        this.outputs = this.precedingTilesToArray(changes.precedingTilesOutputs.currentValue);
        this.input = changes.tileInputInfo.currentValue;
    };
    VisualMapperComponent.prototype.clickRemove = function () {
        this.selectedValue = '';
        this.showList = false;
    };
    __decorate([
        core_1.Output(), 
        __metadata('design:type', core_1.EventEmitter)
    ], VisualMapperComponent.prototype, "mappingChange", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], VisualMapperComponent.prototype, "mappings", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Array)
    ], VisualMapperComponent.prototype, "precedingTilesOutputs", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], VisualMapperComponent.prototype, "tileInputInfo", void 0);
    VisualMapperComponent = __decorate([
        core_1.Component({
            selector: 'flogo-transform-visual-mapper',
            moduleId: module.id,
            template: "<!--<div *ngFor=\"let input of tileInputInfo\" class=\"flogo-visual-mapper\" >--> <div class=\"flogo-visual-mapper\">      <div class=\"flogo-visual-mapper__item\">         <div class=\"flogo-visual-mapper__item__remove\" [hidden]=\"!selectedValue\"><span class=\"glyphicon glyphicon-remove\" (click)=\"clickRemove($event)\" aria-hidden=\"true\"></span></div>         <div class=\"flogo-visual-mapper__item__output\" [class.flogo-visual-mapper__item__output--connected]=\"selectedValue\">             <div>                 <input type=\"text\"  [(ngModel)]=\"selectedValue\"                        (focus)=\"focusInputText($event)\" (keyup)=\"onKeyPress($event)\"                        class=\"flogo-visual-mapper__item__output__text\">             </div>         </div>          <div class=\"flogo-visual-mapper__item__input\" [class.flogo-visual-mapper__item__input--connected]=\"selectedValue != ''\">{{input.name}}</div>     </div>      <div class=\"flogo-visual-mapper__item__list\" [class.flogo-visual-mapper__item__list--selectedvalue]=\"selectedValue\"> <ul *ngFor=\"let output of outputs\" [hidden]=\"!showList\">     <li class=\"\">{{output.name}}</li>     <ul>         <li class=\"\"             *ngFor=\"let field of output.fields\" (click)=\"clickField(output, field)\">{{output.name}}.{{field.name}} </li>     </ul> </ul> </div>  </div>",
            styles: [".flogo-visual-mapper {   margin-top: 10px;   /*   .flogo-visual-mapper__item:before {     //content: \"20ac\";     font-family: \"Glyphicons Halflings\";     content: \"e088\";     position: relative;     top: 5px;     color:red;     cursor: pointer;     //left: 7px;   }   */ } .flogo-visual-mapper .flogo-visual-mapper__item {   display: flex;   flex-direction: row;   height: 40px; } .flogo-visual-mapper .flogo-visual-mapper__item__remove {   flex: 0 0 5%;   cursor: pointer; } .flogo-visual-mapper .flogo-visual-mapper__item__output {   flex: 0 0 60%;   background: #b3e3ff;   margin: 0 10px 0 0; } .flogo-visual-mapper .flogo-visual-mapper__item__output__text {   width: 80%;   background-color: transparent;   border: 0; } .flogo-visual-mapper .flogo-visual-mapper__item__output__text:focus {   outline-width: 0; } .flogo-visual-mapper .flogo-visual-mapper__item__input {   flex: 0 0 35%;   background-color: #ccd0d8;   color: #000; } .flogo-visual-mapper .flogo-visual-mapper__item__list {   width: 60%;   margin-bottom: 10px;   margin-top: 0;   background-color: #e6e7e9; } .flogo-visual-mapper .flogo-visual-mapper__item__list li {   cursor: pointer; } .flogo-visual-mapper .flogo-visual-mapper__item__list--selectedvalue {   left: 30px;   position: relative; } .flogo-visual-mapper .flogo-visual-mapper__item__output, .flogo-visual-mapper .flogo-visual-mapper__item__input {   display: block;   float: left;   text-align: center;   padding: 10px;   position: relative;   text-decoration: none; } .flogo-visual-mapper .flogo-visual-mapper__item__output:after {   content: \"\";   border-top: 20px solid transparent;   border-bottom: 20px solid transparent;   border-left: 20px solid #b3e3ff;   position: absolute;   right: -20px;   top: 0;   z-index: 1; } .flogo-visual-mapper .flogo-visual-mapper__item__input:before {   content: \"\";   border-top: 20px solid transparent;   border-bottom: 20px solid transparent;   border-left: 20px solid #fff;   position: absolute;   left: 0;   top: 0; } .flogo-visual-mapper .flogo-visual-mapper__item__output--connected {   left: 10px; } .flogo-visual-mapper .flogo-visual-mapper__item__input--connected {   background-color: #ccd0d8; }"]
        }), 
        __metadata('design:paramtypes', [])
    ], VisualMapperComponent);
    return VisualMapperComponent;
}());
exports.VisualMapperComponent = VisualMapperComponent;
