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

    ngOnChanges(changes:any) {
    }

    togglePanel() {

        this.isCollapsed = !this.isCollapsed;

        this.toggledControl.emit({
            isInput:this.isInput,
            isCollapsed: this.isCollapsed
        });
    }

}
