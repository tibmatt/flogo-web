import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'flogo-apps-search',
    moduleId: module.id,
    templateUrl: 'search.tpl.html',
    styleUrls:['search.component.css']
})
export class FlogoApplicationSearch {
    @Input() placeholder: string = '';
    @Output() changedSearch: EventEmitter<string> = new EventEmitter<string>();


    onSearchInputChanged(events) {
        this.changedSearch.emit(events.target.value);
    }


}
