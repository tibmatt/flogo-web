import { Component, ElementRef, EventEmitter, Input, OnInit, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { TranslateService } from 'ng2-translate/ng2-translate';

import { IFlogoApplicationModel } from '../../../common/application.model';
import { notification } from '../../../common/utils';
import { ERROR_CONSTRAINT } from '../../../common/constants';
import {AppsApiService} from "../../../common/services/restapi/v2/apps-api.service";

@Component({
  selector: 'flogo-apps-list',
  moduleId: module.id,
  templateUrl: 'app.list.tpl.html',
  styleUrls: ['app.list.css']
})
export class FlogoAppListComponent implements OnInit {
  // @ViewChild('importInput') importInput: ElementRef;
  @Output() onSelectedApp: EventEmitter<IFlogoApplicationModel> = new EventEmitter<IFlogoApplicationModel>();

  public applications: Array<IFlogoApplicationModel> = [];

  constructor(public translate: TranslateService,
              private apiApplications: AppsApiService) {
  }

  ngOnInit() {
    this.listAllApps();
  }

  onSelectApp(event: Event, removeBox: ElementRef, app: IFlogoApplicationModel) {
    if (!(event.target === removeBox.nativeElement || removeBox.nativeElement.contains(event.target))) {
      this.appSelected(app);
    }
  }

  onImportFileSelected($event) {
    let file: File = $event.target.files[0];
    let fileReader: FileReader = new FileReader();
    fileReader.onload = this.uploadApp();
    fileReader.readAsText(file);
  }

  uploadApp() {
    let appListComponent = this;
    return function(readerEvent){
      try {
        let appData = JSON.parse(readerEvent.target.result);
        appListComponent.apiApplications.uploadApplication(appData)
          .then((application)=>{
            appListComponent.applications.push(application);
            appListComponent.applications = _.sortBy(appListComponent.applications, 'name');
          }).catch((error)=>{
          console.log(error);
        });
      } catch (error) {
        console.log(error);
      }
    }
  }

  getErrorMessage(error) {
    // todo: multiple error messages?
    // todo: error detail
    let message = 'APP-LIST:BROKEN_RULE_UNKNOWN';
    if (error[ERROR_CONSTRAINT.WRONG_INPUT_JSON_FILE]) {
      message = 'APP-LIST:BROKEN_RULE_WRONG_INPUT_JSON_FILE';
    }

    if (error[ERROR_CONSTRAINT.NOT_INSTALLED_ACTIVITY]) {
      message = 'APP-LIST:BROKEN_RULE_NOT_INSTALLED_ACTIVITY';
    }

    if (error[ERROR_CONSTRAINT.NOT_INSTALLED_TRIGGER]) {
      message = 'APP-LIST:BROKEN_RULE_NOT_INSTALLED_TRIGGER';
    }

    return this.translate.instant(message);
  }

  onAdd() {
    this.apiApplications.createNewApp()
      .then((application: IFlogoApplicationModel) => {
        this.appSelected(application);
      });
  }

  listAllApps() {
    this.apiApplications.listApps()
      .then((applications: Array<IFlogoApplicationModel>) => {
        this.applications = _.sortBy(applications, 'name');
      });
  }

  remove(application: IFlogoApplicationModel) {
    this.apiApplications.deleteApp(application.id)
      .then(() => {
        this.listAllApps();
      });
  }

  private appSelected(app) {
    this.onSelectedApp.emit(app);
  }

}
