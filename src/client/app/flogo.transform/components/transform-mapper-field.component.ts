import { Component, Input, Output, EventEmitter, OnChanges, OnInit } from '@angular/core';
import { mappingsValidateField } from '../validators/validators';

@Component({
    selector: 'flogo-transform-mapper-field',
    moduleId: module.id,
    directives: [],
    styleUrls: ['transform-mapper-field.component.css'],
    templateUrl: 'transform-mapper-field.tpl.html'
})
export class TransformMapperField implements  OnChanges, OnInit {
    @Input() tile:any;
    @Input() mappings:any;
    @Input() precedingTilesOutputs:any;
    @Input() tileInputInfo:any;
    @Input() tileInfo:any;
    selectedValue:string = '';
    showList:boolean  = false;
    tiles:any[] = [];
    hasError:boolean = false;
    messageError:string = '';


    ngOnInit() {
    }

    onKeyUp(target:any) {
        this.validateField(target.value);
    }

    validateField(value:string) {
        let errors:any = mappingsValidateField(this.tileInfo, this.wrapInJSON(value));
        if(errors&&errors.invalidMappings) {
            this.setError(true,this.getErrorMessage(errors.invalidMappings.errors || []) )
        }else {
            this.setError(false, '');
        }
    }

    setError(hasError:boolean, message:string) {
        this.hasError = hasError;
        this.messageError  = message;
    }

    getErrorMessage(errors:any[]) {
        let message = '';

        errors.forEach(function (error) {
            message += 'Invalid field \n' + error.value.value + ' mapping to ' + error.value.mapTo;
        });
        return message;
    }

    precedingTilesToArray(precedingTiles:any) {
        var tiles = [];

        for(var tileName in precedingTiles || {}) {
            var tile = {name: tileName, fields: precedingTiles[tileName]};
            tiles.push(tile);
        }

        return tiles;
    }

    ngOnChanges(changes:any) {

        if(changes.precedingTilesOutputs && this.tiles) {
            this.tiles = this.precedingTilesToArray(changes.precedingTilesOutputs.currentValue);
        }

    }

    toggleList() {
        this.showList = !this.showList;
    }

    onKeyPress(event) {
        if(event.keyCode == 27) {
            this.showList = false;
        }
    }

    clickField(output, field) {
        this.selectedValue = output.name + '.' + field.name;
        this.validateField(this.selectedValue);
        this.showList = false;
    }

    clickRemove() {
        this.selectedValue = '';
        this.showList = false;
        this.setError(false, '');
    }

    wrapInJSON(value) {
        return '[ { "type": 1, "value": "' + value + '", "mapTo": "' + this.tile.name + '" } ]'

    }

}
