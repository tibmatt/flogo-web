import { Component, Input, Output, OnChanges, EventEmitter } from '@angular/core';

@Component({
    selector: 'flogo-json-panel',
    moduleId: module.id,
    templateUrl: 'transform-json-panel.tpl.html',
    outputs: ['toggledControl:toggled'],
    styleUrls: ['transform-json-panel.component.css']
})
export class TransformJsonPanelComponent implements OnChanges {
    @Input() schema: any = {};
    @Input() name: string = '';
    @Input() isInput: boolean = false;
    isCollapsed:boolean = true;

    private toggledControl:EventEmitter<any> = new EventEmitter();

    ngOnInit() {
        //this.getFormattedHTML(this.schema, 'tile','rest-trigger');
    }

    ngOnChanges(changes:any) {
    }

    togglePanel() {

        this.isCollapsed = !this.isCollapsed;

        this.toggledControl.emit({
            isInput:this.isInput,
            isCollapsed: this.isCollapsed
        });
    }

    wrapInDiv(value:string, isSelected:boolean) {
        let html:string = '';

        html += `<div class="ft-json__selected"`;
        if(isSelected) {
            html+= ' style="font-weight:bold"';
        }
        html += `>${value}</div>`;

        return html;
    }

    getFormattedHTML(jsonSchema:any, tileSelected:string, fieldSelected:string ) {
        let html:string = '';
        let isSelected:boolean = false;

        for(var tile in jsonSchema) {

            // Check if is an array, in this case if is a tile
            if(jsonSchema[tile] instanceof Array) {

                html += this.wrapInDiv(`"${tile}":[`,false);

                for(var fieldIndex in jsonSchema[tile]) {
                    html += this.wrapInDiv('{', false);
                    isSelected =  (tile == tileSelected && jsonSchema[tile][fieldIndex]['name'] == fieldSelected);

                    for(var field in jsonSchema[tile][fieldIndex]) {
                        debugger;
                        html += this.wrapInDiv(`"${field}":"${jsonSchema[tile][fieldIndex][field]}"`, isSelected);
                    }

                    html += this.wrapInDiv('}', false);
                }

                html += this.wrapInDiv(']', false);
            }

        }

        return html;
    }

}
