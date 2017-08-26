import { Component, Input, Output, EventEmitter, OnChanges } from '@angular/core';

@Component({
    selector: 'flogo-transform-visual-mapper',
    // moduleId: module.id,
    templateUrl: 'visual-mapper.tpl.html',
    styleUrls: ['visual-mapper.component.less']
})

export class VisualMapperComponent implements OnChanges {
    @Output() mappingChange: EventEmitter<any>;
    @Input() mappings: any = '';
    @Input() precedingTilesOutputs: any[] = [];
    @Input() tileInputInfo: any;
    outputs: any[] = [];
    showList = false;
    selectedValue: string;
    input: any;

    constructor() {
        this.selectedValue = '';
        this.showList = false;
        this.mappingChange = new EventEmitter();
    }

    precedingTilesToArray(precedingTiles: any) {
      return Object.keys((precedingTiles || {})).map(tileName => {
        return { name: tileName, fields: precedingTiles[tileName] };
      });
    }

    focusInputText(event) {
        this.showList = true;
    }

    onKeyPress(event) {
        if (event.keyCode === 27) {
            this.showList = false;
        }
    }

    clickField(output, field) {
        this.selectedValue = output.name + '.' + field.name;
        this.showList = false;
    }

    ngOnChanges(changes: any) {
        this.outputs = this.precedingTilesToArray(changes.precedingTilesOutputs.currentValue);
        this.input = changes.tileInputInfo.currentValue;
    }

    clickRemove(event) {
        this.selectedValue = '';
        this.showList = false;
    }


}
