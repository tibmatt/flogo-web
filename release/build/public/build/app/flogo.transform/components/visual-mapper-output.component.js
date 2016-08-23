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
var VisualMapperOutputComponent = (function () {
    function VisualMapperOutputComponent() {
        this.tilesOutputs = [];
        this.showList = false;
    }
    VisualMapperOutputComponent.prototype.focus = function (event) {
        this.showList = true;
    };
    VisualMapperOutputComponent.prototype.blur = function (event) {
        this.showList = false;
    };
    VisualMapperOutputComponent.prototype.ngOnChanges = function (changes) {
    };
    VisualMapperOutputComponent.prototype.clickField = function (output, field) {
        this.selectedValue = output.name + '.' + field.name;
        this.showList = false;
    };
    VisualMapperOutputComponent.prototype.onKeyPress = function (event) {
        if (event.keyCode == 27) {
            this.showList = false;
        }
    };
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], VisualMapperOutputComponent.prototype, "outputs", void 0);
    VisualMapperOutputComponent = __decorate([
        core_1.Component({
            selector: 'flogo-transform-visual-mapper-output',
            moduleId: module.id,
            styles: [".flogo-visual-mapper {   margin-top: 10px;   /*   .flogo-visual-mapper__item:before {     //content: \"20ac\";     font-family: \"Glyphicons Halflings\";     content: \"e088\";     position: relative;     top: 5px;     color:red;     cursor: pointer;     //left: 7px;   }   */ } .flogo-visual-mapper .flogo-visual-mapper__item {   display: flex;   flex-direction: row;   height: 40px; } .flogo-visual-mapper .flogo-visual-mapper__item__remove {   flex: 0 0 5%;   cursor: pointer; } .flogo-visual-mapper .flogo-visual-mapper__item__output {   flex: 0 0 60%;   background: #b3e3ff;   margin: 0 10px 0 0; } .flogo-visual-mapper .flogo-visual-mapper__item__output__text {   width: 80%;   background-color: transparent;   border: 0; } .flogo-visual-mapper .flogo-visual-mapper__item__output__text:focus {   outline-width: 0; } .flogo-visual-mapper .flogo-visual-mapper__item__input {   flex: 0 0 35%;   background-color: #ccd0d8;   color: #000; } .flogo-visual-mapper .flogo-visual-mapper__item__list {   width: 60%;   margin-bottom: 10px;   margin-top: 0;   background-color: #e6e7e9; } .flogo-visual-mapper .flogo-visual-mapper__item__list li {   cursor: pointer; } .flogo-visual-mapper .flogo-visual-mapper__item__list--selectedvalue {   left: 30px;   position: relative; } .flogo-visual-mapper .flogo-visual-mapper__item__output, .flogo-visual-mapper .flogo-visual-mapper__item__input {   display: block;   float: left;   text-align: center;   padding: 10px;   position: relative;   text-decoration: none; } .flogo-visual-mapper .flogo-visual-mapper__item__output:after {   content: \"\";   border-top: 20px solid transparent;   border-bottom: 20px solid transparent;   border-left: 20px solid #b3e3ff;   position: absolute;   right: -20px;   top: 0;   z-index: 1; } .flogo-visual-mapper .flogo-visual-mapper__item__input:before {   content: \"\";   border-top: 20px solid transparent;   border-bottom: 20px solid transparent;   border-left: 20px solid #fff;   position: absolute;   left: 0;   top: 0; } .flogo-visual-mapper .flogo-visual-mapper__item__output--connected {   left: 10px; } .flogo-visual-mapper .flogo-visual-mapper__item__input--connected {   background-color: #ccd0d8; }"],
            template: "    <div class=\"flogo-visual-mapper-output__text\">         <!--<input type=\"text\" (focus)=\"focus()\" (keyup)=\"onKeyPress($event)\" [(ngModel)]=\"selectedValue\">-->     </div>      <div class=\"flogo-visual-mapper-output__list\" [hidden]=\"!showList\">        <!--        <ul *ngFor=\"let output of outputs\">          <li class=\"flogo-visual-mapper-output__tile-name\">{{output.name}}</li>             <ul>                 <li class=\"flogo-visual-mapper-output__tile-path\"                 *ngFor=\"let field of output.fields\" (click)=\"clickField(output, field)\">{{output.name}}.{{field.name}} </li>             </ul>         </ul>         -->     </div>"
        }), 
        __metadata('design:paramtypes', [])
    ], VisualMapperOutputComponent);
    return VisualMapperOutputComponent;
}());
exports.VisualMapperOutputComponent = VisualMapperOutputComponent;
