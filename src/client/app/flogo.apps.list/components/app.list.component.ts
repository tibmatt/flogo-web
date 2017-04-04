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
            appListComponent.notifyUser(true);
          }).catch((error)=>{
          appListComponent.notifyUser(false, error);
        });
      } catch (error) {
        appListComponent.notifyUser(false, error);
      }
    }
  }

  notifyUser(isImported: boolean, errorDetails?: Error) {
    let message = 'APP-LIST:BROKEN_RULE_UNKNOWN';

    if(isImported) {
      message = 'APP-LIST:SUCCESSFULLY-IMPORTED';
      notification(this.translate.instant(message), 'success', 3000);
    } else {
      message = this.getErrorMessage(errorDetails);
      notification(this.translate.instant(message), 'error');
    }
  }

  getErrorMessage(error) {
    let message = 'APP-LIST:BROKEN_RULE_UNKNOWN';

    if(error.name === 'Syntax Error'){
      message = 'APP-LIST:BROKEN_RULE_WRONG_INPUT_JSON_FILE';
    } else {
      message = 'APP-LIST:BROKEN_RULE_VALIDATION_ERROR';
    }
    return message;
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
