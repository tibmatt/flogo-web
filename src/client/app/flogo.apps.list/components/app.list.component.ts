import { Component, ElementRef, EventEmitter, Input, OnInit, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { TranslateService } from 'ng2-translate/ng2-translate';

import { IFlogoApplicationModel } from '../../../common/application.model';
import { RESTAPIApplicationsService}  from '../../../common/services/restapi/applications-api.service';
import { notification } from '../../../common/utils';
import { CODE_BROKEN_RULE } from '../../../common/constants';

@Component({
  selector: 'flogo-apps-list',
  moduleId: module.id,
  templateUrl: 'app.list.tpl.html',
  styleUrls: ['app.list.css']
})
export class FlogoAppListComponent implements OnInit, OnChanges {
  @ViewChild('importInput') importInput: ElementRef;
  @Input() currentApp: IFlogoApplicationModel;
  @Output() onSelectedApp: EventEmitter<IFlogoApplicationModel> = new EventEmitter<IFlogoApplicationModel>();
  @Output() onAddedApp: EventEmitter<IFlogoApplicationModel> = new EventEmitter<IFlogoApplicationModel>();
  @Output() onDeletedApp: EventEmitter<IFlogoApplicationModel> = new EventEmitter<IFlogoApplicationModel>();

  public applications: Array<IFlogoApplicationModel> = [];

  constructor(public translate: TranslateService,
              private apiApplications: RESTAPIApplicationsService) {
  }

  ngOnInit() {
    this.listAllApps();
  }

  ngOnChanges(changes: SimpleChanges) {
    let change = changes['currentApp'];
    if (change) {
      let prevId = change.previousValue && change.previousValue.id;
      let currentId = change.currentValue && change.currentValue.id;

      if (prevId != currentId) {
        this.listAllApps();
      }

    }
  }

  onSelectApp(event: Event, removeBox: ElementRef, app: IFlogoApplicationModel) {
    if (!(event.target == removeBox.nativeElement || removeBox.nativeElement.contains(event.target))) {
      this.appSelected(app);
    }
  }

  onImportFileSelected(event) {
    let file = <File> _.get(event,'target.files[0]');

    // clean input file value
    event.target.value = '';

    this.apiApplications.uploadApplication(file)
      .then((results: any) => {
        let createdApp = results.createdApp;
        this.applications.push(createdApp);
        let message = this.translate.instant('APP-LIST:SUCCESSFULLY-IMPORTED');
        this.appSelected(createdApp);
        notification(message, 'success', 3000);
      })
      .catch((error) => {
        notification(this.getErrorMessage(error), 'error');
      });
  }

  getErrorMessage(error) {
    if(error[CODE_BROKEN_RULE.WRONG_INPUT_JSON_FILE]) {
      return this.translate.instant('APP-LIST:BROKEN_RULE_WRONG_INPUT_JSON_FILE');
    }

    if(error[CODE_BROKEN_RULE.NOT_INSTALLED_ACTIVITY]) {
      return this.translate.instant('APP-LIST:BROKEN_RULE_NOT_INSTALLED_ACTIVITY');
    }

    if(error[CODE_BROKEN_RULE.NOT_INSTALLED_TRIGGER]) {
      return this.translate.instant('APP-LIST:BROKEN_RULE_NOT_INSTALLED_TRIGGER');
    }

    return this.translate.instant('APP-LIST:BROKEN_RULE_UNKNOWN');
  }

  onAdd() {
    this.apiApplications.createNewApp()
      .then((application: IFlogoApplicationModel) => {
        this.onAddedApp.emit(application);
        this.appSelected(application);
      }).then(() => this.listAllApps());
  }

  listAllApps() {
    this.apiApplications.getAllApps()
      .then((applications: Array<IFlogoApplicationModel>) => {
        this.applications = applications;
      })
  }

  remove(application: IFlogoApplicationModel) {
    this.apiApplications.deleteApp(application.id)
      .then(() => {
        this.listAllApps();
        this.onDeletedApp.emit(application);
      })
  }

  private appSelected(app) {
    this.onSelectedApp.emit(app);
  }

}
