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
    selectedApp:string = '';

    onSelectApp(app:string) {
        this.selectedApp = app;
        this.onSelectedApp.emit(app);
    }

    public addApp() {
        this._addApp();
    }

    public _addApp() {
        let newApp:string = this.getNewAppName(UNTITLED_APP);
        this.applications.push(newApp);
        this.onSelectApp(newApp);
    }

    getNewAppName(name:string, count = 0) {
        let appName:string = name +  (count > 0 ?   ` ${count}` : '');

        if(this.applications.indexOf(appName) !== -1) {
            return this.getNewAppName(name , ++count);
        } else {
            return appName;
        }
    }

}
