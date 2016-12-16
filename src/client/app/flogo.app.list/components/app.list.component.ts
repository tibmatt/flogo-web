import { Component, EventEmitter,  Input, OnChanges, Output, SimpleChange,  } from '@angular/core';
import {FlogoModal} from '../../../common/services/modal.service';
import { By } from '@angular/platform-browser';

const UNTITLED_APP = 'Untitled App';

@Component({
    selector: 'flogo-app-list',
    moduleId: module.id,
    templateUrl: 'app.list.tpl.html',
    styleUrls: ['app.list.css'],
    directives: [],
    providers: [FlogoModal]

})
export class FlogoAppList {
    @Input() applications: string[];
    @Output() onSelectedApp:EventEmitter<string> = new EventEmitter<string>();
    @Output() onAddedApp:EventEmitter<string> = new EventEmitter<string>();
    @Output() onDeletedApp:EventEmitter<string> = new EventEmitter<string>();
    selectedApp:string = '';
    overApp:string = '';

    constructor(public flogoModal: FlogoModal) {

    }

    onSelectApp(app:string) {
        this.selectedApp = app;
        this.onSelectedApp.emit(app);
    }

    onDeleteApp(app:string) {

        this.flogoModal.confirmDelete('Are you sure you want to delete ' + app +  ' application?').then((res) => {
            if (res) {
                this._delete(app);
            } else {
                // omit
            }
        });

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

    private _delete(app:string) {
        _.pull(this.applications, app);
        this.onDeletedApp.emit(app);
        this.selectedApp = this.overApp = '';
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
