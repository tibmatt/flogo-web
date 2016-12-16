import { Component, EventEmitter,  Input, OnChanges, Output, SimpleChange,  } from '@angular/core';
import { By } from '@angular/platform-browser';

const UNTITLED_APP = 'Untitled App';

@Component({
    selector: 'flogo-app-list',
    moduleId: module.id,
    templateUrl: 'app.list.tpl.html',
    styleUrls: ['app.list.css'],
    directives: []
})
export class FlogoAppList {
    @Input() applications: string[];
    @Output() onSelectedApp:EventEmitter<string> = new EventEmitter<string>();
    @Output() onAddedApp:EventEmitter<string> = new EventEmitter<string>();
    @Output() onDeletedApp:EventEmitter<string> = new EventEmitter<string>();
    selectedApp:string = '';
    overApp:string = '';

    onSelectApp(app:string) {
        this.selectedApp = app;
        this.onSelectedApp.emit(app);
    }

    onDeleteApp(app:string) {
        this.onDeletedApp.emit(app);
    }

    public add() {
        this._add();
    }

    public _add() {
        let newApp:string = this.getNewAppName(UNTITLED_APP);
        this.applications.unshift(newApp);
        this.onAddedApp.emit(newApp);
        this.onSelectApp(newApp);
    }

    getNewAppName(name:string, count = 0) {
        let appName:string = name +  (count > 0 ?   ` (${count})` : '');

        if(this.applications.indexOf(appName) !== -1) {
            return this.getNewAppName(name , ++count);
        } else {
            return appName;
        }
    }

    onMouseOver(app:string) {
        this.overApp = app;
    }

    onMouseOut() {
        this.overApp = '';
    }

}
