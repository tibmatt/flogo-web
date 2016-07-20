import { Component, Input, Output, EventEmitter, OnChanges, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import { VisualMapperOutputComponent } from './visual-mapper-output.component';

@Component({
    selector: 'flogo-transform-visual-mapper',
    moduleId: module.id,
    templateUrl: 'visual-mapper.tpl.html',
    styleUrls: ['visual-mapper.css'],
    directives: [VisualMapperOutputComponent]
})

export class VisualMapperComponent {
    @Output() mappingChange:EventEmitter<any>;
    @Input() mappings:any = '';
    @Input() precedingTilesOutputs:any[] = [];
    outputs:any[] = [];

    constructor() {
        this.mappingChange = new EventEmitter();
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
        this.outputs = this.precedingTilesToArray(changes.precedingTilesOutputs.currentValue);
    }


}
