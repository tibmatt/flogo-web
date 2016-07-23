import { Component, Input, Output, EventEmitter, OnChanges, OnInit } from '@angular/core';

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
    selectedValue:string = '';
    showList:boolean  = false;
    tiles:any[] = [];
    hasError:boolean = false;


    ngOnInit() {
    }

    onChangeText(event) {
        debugger;
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
        debugger;

        if(changes.precedingTilesOutputs && this.tiles) {
            this.tiles = this.precedingTilesToArray(changes.precedingTilesOutputs.currentValue);
        }

    }

    focusInputText() {
        this.showList = true;
    }

    onKeyPress(event) {
        if(event.keyCode == 27) {
            this.showList = false;
        }
    }

    clickField(output, field) {
        this.selectedValue = output.name + '.' + field.name;
        this.showList = false;
    }

    clickRemove() {
        this.selectedValue = '';
        this.showList = false;
    }

}
