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
var validators_1 = require('../validators/validators');
var TransformMapperField = (function () {
    function TransformMapperField(_eref) {
        this._eref = _eref;
        this.selectedValue = '';
        this.showList = false;
        this.tiles = [];
        this.hasError = false;
        this.messageError = '';
        this.selectedTile = '';
        this.selectedInput = '';
        this.overInput = false;
        this.mappingChange = new core_1.EventEmitter();
        this.itemOver = new core_1.EventEmitter();
    }
    TransformMapperField.prototype.onClick = function (event) {
        var nativeElement = this._eref.nativeElement;
        if (event.target !== nativeElement && !nativeElement.contains(event.target)) {
            this.showList = false;
        }
    };
    TransformMapperField.prototype.ngOnInit = function () {
    };
    TransformMapperField.prototype.onMouseLeave = function () {
        this.emittItemOver('', '');
        this.overInput = false;
    };
    TransformMapperField.prototype.onMouseOver = function (tile, field, type) {
        this.emittItemOver(tile, field);
        if (type == 'input') {
            this.overInput = true;
        }
    };
    TransformMapperField.prototype.emittItemOver = function (tile, field) {
        this.itemOver.emit({ tile: tile, name: field });
    };
    TransformMapperField.prototype.resetStatus = function () {
        this.selectedTile = '';
        this.selectedInput = '';
        this.showList = false;
    };
    TransformMapperField.prototype.onFocusText = function (input) {
        this.selectedTile = '';
        this.selectedInput = input;
        this.showList = true;
    };
    TransformMapperField.prototype.onKeyUp = function (value) {
        this.emitChange(value);
    };
    TransformMapperField.prototype.emitChange = function (value) {
        this.validateField(value);
        this.mappingChange.emit({
            field: this.tile.name,
            value: value,
            hasError: this.hasError,
            errors: this.errors
        });
    };
    TransformMapperField.prototype.setSelectedTile = function (value) {
        if (this.selectedTile == value) {
            this.selectedTile = '';
        }
        else {
            this.selectedTile = value;
        }
    };
    TransformMapperField.prototype.validateField = function (value) {
        if (!value) {
            this.setError(false, '');
        }
        else {
            this.errors = validators_1.mappingsValidateField(this.tileInfo, this.wrapInJSON(value));
            if (this.errors && this.errors.invalidMappings) {
                this.setError(true, this.getErrorMessage(this.errors.invalidMappings.errors || []));
            }
            else {
                this.setError(false, '');
            }
        }
    };
    TransformMapperField.prototype.setError = function (hasError, message) {
        this.hasError = hasError;
        this.messageError = message;
    };
    TransformMapperField.prototype.getErrorMessage = function (errors) {
        var message = '';
        errors.forEach(function (error) {
            message += 'Invalid field \n' + error.value.value + ' mapping to ' + error.value.mapTo;
        });
        return message;
    };
    TransformMapperField.prototype.precedingTilesToArray = function (precedingTiles) {
        var tiles = [];
        for (var tileName in precedingTiles || {}) {
            var tile = { name: tileName, fields: precedingTiles[tileName] };
            tiles.push(tile);
        }
        return tiles;
    };
    TransformMapperField.prototype.ngOnChanges = function (changes) {
        var _this = this;
        var mapping = this.mappings.find(function (item) {
            return item.mapTo == _this.tile.name;
        });
        if (mapping) {
            this.selectedValue = mapping.value;
            this.emitChange(this.selectedValue);
        }
        if (changes.precedingTilesOutputs && this.tiles) {
            this.tiles = this.precedingTilesToArray(changes.precedingTilesOutputs.currentValue);
        }
    };
    TransformMapperField.prototype.toggleList = function () {
        this.showList = !this.showList;
    };
    TransformMapperField.prototype.onKeyPress = function (event) {
        if (event.keyCode == 27) {
            this.showList = false;
            this.selectedInput = '';
        }
    };
    TransformMapperField.prototype.clickField = function (output, field) {
        this.selectedValue = output.name + '.' + field.name;
        this.emitChange(this.selectedValue);
        this.showList = false;
        return true;
    };
    TransformMapperField.prototype.clickRemove = function () {
        this.selectedValue = '';
        this.showList = false;
        this.setError(false, '');
        this.emitChange('');
    };
    TransformMapperField.prototype.wrapInJSON = function (value) {
        return '[ { "type": 1, "value": "' + value + '", "mapTo": "' + this.tile.name + '" } ]';
    };
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], TransformMapperField.prototype, "tile", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], TransformMapperField.prototype, "mappings", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], TransformMapperField.prototype, "precedingTilesOutputs", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], TransformMapperField.prototype, "tileInputInfo", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], TransformMapperField.prototype, "tileInfo", void 0);
    __decorate([
        core_1.Output(), 
        __metadata('design:type', core_1.EventEmitter)
    ], TransformMapperField.prototype, "mappingChange", void 0);
    __decorate([
        core_1.Output(), 
        __metadata('design:type', core_1.EventEmitter)
    ], TransformMapperField.prototype, "itemOver", void 0);
    TransformMapperField = __decorate([
        core_1.Component({
            host: {
                '(document: click)': 'onClick($event)'
            },
            selector: 'flogo-transform-mapper-field',
            moduleId: module.id,
            directives: [],
            styles: [".flogo-visual-mapper .shape-connected {   background-color: #eceff4; } .flogo-visual-mapper .shape-connected-over {   background-color: #abb0c5; } .flogo-visual-mapper .shape {   flex-direction: row;   justify-content: space-between;   margin-top: 20px;   display: flex;   width: 630px; } .flogo-visual-mapper .shape .output {   background-repeat: no-repeat; } .flogo-visual-mapper .shape .output .output-text {   width: 90%;   height: 90%;   border: 0; } .flogo-visual-mapper .shape .output .connected {   align-items: center;   background-image: url('/assets/svg/flogo.transform.output-shape-connected.svg');   display: flex;   height: 40px;   justify-content: center;   width: 369px; } .flogo-visual-mapper .shape .output .connected .output-text:focus {   outline-width: 0; } .flogo-visual-mapper .shape .output .not-connected {   align-items: center;   background-image: url('/assets/svg/flogo.transform.output-shape-not-connected.svg');   display: flex;   height: 40px;   justify-content: center;   width: 321px; } .flogo-visual-mapper .shape .output .not-connected .output-text:focus {   outline-width: 0;   width: 90%; } .flogo-visual-mapper .shape .output .not-connected.active {   background-image: url('/assets/svg/flogo.transform.output-shape-not-connected-active.svg'); } .flogo-visual-mapper .shape .output .connected.active {   background-image: url('/assets/svg/flogo.transform.output-shape-connected-active.svg'); } .flogo-visual-mapper .shape .input-shape {   background-image: url('/assets/svg/flogo.transform.input-shape.svg');   height: 40px;   width: 250px;   text-align: center; } .flogo-visual-mapper .shape .input-shape .connected, .flogo-visual-mapper .shape .input-shape .not-connected {   height: 100%;   padding-top: 8px; } .flogo-visual-mapper .shape .input-shape .connected:hover, .flogo-visual-mapper .shape .input-shape .not-connected:hover {   color: white; } .flogo-visual-mapper .shape .input-shape:hover {   background-image: url('/assets/svg/flogo.transform.input-shape-hover.svg');   color: white; } .flogo-visual-mapper .flogo-visual-mapper__item__list {   width: 315px;   background-color: white;   z-index: 900;   position: absolute;   /*     border-right: 2px solid #a5d377;     border-bottom: 2px solid #a5d377;     border-left: 2px solid #a5d377;     */ } .flogo-visual-mapper .flogo-visual-mapper__item_list--active {   border-right: 2px solid #a5d377;   border-bottom: 2px solid #a5d377;   border-left: 2px solid #a5d377; } .flogo-visual-mapper .flogo-visual-mapper__item__list__item {   margin-top: 0;   padding-top: 0; } .flogo-visual-mapper .flogo-visual-mapper__item__action {   color: dimgray;   font-size: 0.8em; } .flogo-visual-mapper .flogo-visual-mapper__item__name {   font-weight: bold;   margin-left: 5px;   margin-top: 0;   margin-bottom: 5px;   cursor: pointer;   list-style-type: none;   display: inline; } .flogo-visual-mapper .flogo-visual-mapper__item__list__field {   cursor: pointer;   list-style-type: none;   margin-bottom: 5px; } .flogo-visual-mapper .flogo-visual-mapper__item__field {   padding-left: 30px; } .flogo-visual-mapper .flogo-visual-mapper__item__field:hover {   background-color: #ededed; } .flogo-visual-mapper .flogo-visual-mapper__item__remove {   color: dimgray;   cursor: pointer;   margin-right: 6px; } /* @height: 40; @height-item: 25; //@color-output: #3498db; @color-output: #b3e3ff; @color-input: #e6e7e9;  .flogo-visual-mapper {   margin-top:10px;    .flogo-visual-mapper__item {     display: flex;     flex-direction: row;     height: (@height)*1px;    }    .flogo-visual-mapper__item__name {     font-weight: bold;     margin-left: 5px;     margin-top: 0;     margin-bottom: 5px;     cursor:pointer;     list-style-type: none;     display: inline   }    .flogo-visual-mapper__item__field {     margin-left: 30px   }    .flogo-visual-mapper__item__error {     color: red;   }    .flogo-visual-mapper__item__remove {     left:-5px;     color:dimgray;     cursor:pointer   }    .flogo-visual-mapper__item__action {     color:dimgray;     font-size: 0.8em;   }    .flogo-visual-mapper__item__output {     flex: 0 0 60%;     background: @color-output;     margin: 0 10px 0 0;   }    .flogo-visual-mapper__item__output__text {     width: 94%;background-color: transparent;border:0   }    .flogo-visual-mapper__item__output__list__selector {     cursor: pointer;     color: dimgray;   }     .flogo-visual-mapper__item__output__text:focus {     outline-width: 0;   }     .flogo-visual-mapper__item__input {     flex: 0 0 35%;     background-color: #ccd0d8;     color: #000;   }    .flogo-visual-mapper__item__list {     width: 250px;     background-color: white;     z-index: 900;     position: absolute;   }    .flogo-visual-mapper__item__list__item {     margin-top: 0;     padding-top: 0;   }     .flogo-visual-mapper__item__list li {     cursor: pointer;   }    .flogo-visual-mapper__item__list__field {     cursor:pointer;     list-style-type: none;      margin-bottom: 5px;     //margin-left: 10px   }    .flogo-visual-mapper__item__list__field:hover {     background-color: #ededed;   }    .flogo-visual-mapper__item__output, .flogo-visual-mapper__item__input {     display: block;     float: left;     text-align: center;     padding: 10px;     //padding: 15px 40px 0 40px;     position: relative;     //font-size: 10px;     text-decoration: none;   }    .flogo-visual-mapper__item__output:after {     content: \"\";     border-top: (@height-item - 5)*1px solid transparent;     border-bottom: (@height-item - 5)*1px solid transparent;     border-left: (@height-item - 5)*1px solid @color-output;     position: absolute;     right: -(@height-item - 5)*1px;     top: 0;     z-index: 1;   }    .flogo-visual-mapper__item__input:before {     content: \"\";     border-top: (@height-item - 5)*1px solid transparent;     border-bottom: (@height-item - 5)*1px solid transparent;     border-left: (@height-item - 5)*1px solid #fff;     position: absolute;     left: 0;     top: 0   }    .flogo-visual-mapper__item__output--connected {     margin-right: 0;   }   .flogo-visual-mapper__item__input--connected {     background-color: #ccd0d8;     flex: 0 0 30%;   } } */"],
            template: "<div class=\"flogo-visual-mapper\">      <div class=\"shape\" [ngClass]=\"{'shape-connected':selectedValue, 'shape-connected-over':selectedValue && overInput}\">          <div class=\"output\">             <div [ngClass]=\"{'connected':selectedValue, 'not-connected':!selectedValue}\">                  <img src=\"/assets/svg/flogo.transform.closeicon.svg\"                      class=\"flogo-visual-mapper__item__remove\" (click)=\"clickRemove($event)\"                      aria-hidden=\"true\" [hidden]=\"!selectedValue\" alt=\"Remove connection\">                  <input type=\"text\"  [(ngModel)]=\"selectedValue\"                        (click)=\"onFocusText(tile.name)\"                        (keyup)=\"onKeyPress($event)\"                        (keyup)=\"onKeyUp($event.target.value)\"                        [attr.data-flogo-output-for]=\"tile.name\"                        class=\"output-text\">             </div>         </div>          <div class=\"input-shape\"              (mouseover)=\"onMouseOver('',tile.name, 'input')\"              (mouseleave)=\"onMouseLeave('','')\"              [style.color]=\"hasError ? 'red': 'black'\">             <div [ngClass]=\"{'connected':selectedValue, 'not-connected':!selectedValue}\"                  [attr.data-flogo-input-for]=\"tile.name\">{{tile.name}}</div>         </div>     </div>      <div class=\"flogo-visual-mapper__item__list\" [ngClass]=\"{'flogo-visual-mapper__item_list--active':showList}\">         <div *ngFor=\"let item of tiles\" [hidden]=\"!showList\"  class=\"flogo-visual-mapper__item__list__item\" >              <span class=\"glyphicon flogo-visual-mapper__item__action\"                   [ngClass]=\"{'glyphicon-triangle-right':!selectedTitle, 'glyphicon-triangle-bottom':selectedTile == item.name}\"></span>              <div class=\"flogo-visual-mapper__item__name\" (click)=\"setSelectedTile(item.name)\">{{item.name}}</div>                 <div class=\"flogo-visual-mapper__item__list__field\"                     [hidden]=\"selectedTile != item.name\"                     *ngFor=\"let field of item.fields\"                     (click)=\"clickField(item, field)\">                      <div class=\"flogo-visual-mapper__item__field\"                          (mouseleave)=\"emittItemOver('','')\"                          (mouseover)=\"onMouseOver(item.name, field.name, 'output')\">{{field.name}}</div>                  </div>         </div>     </div>   </div>"
        }), 
        __metadata('design:paramtypes', [core_1.ElementRef])
    ], TransformMapperField);
    return TransformMapperField;
}());
exports.TransformMapperField = TransformMapperField;
