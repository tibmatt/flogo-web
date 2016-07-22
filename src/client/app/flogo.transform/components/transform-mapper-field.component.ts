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
    @Input() preceding:any;
    selectedValue:string = '';
    showList:boolean  = false;
    tiles:any[] = [];


    ngOnInit() {

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

        if(changes.preceding && this.tiles) {
            this.tiles = this.precedingTilesToArray(changes.preceding.currentValue);
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
