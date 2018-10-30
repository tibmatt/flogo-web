import { sortBy } from 'lodash';
import { Component, ElementRef, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { App } from '@flogo/core';
import { NotificationsService } from '@flogo/core/notifications';
import { AppsApiService } from '@flogo/core/services/restapi/v2/apps-api.service';

@Component({
  selector: 'flogo-home-apps-list',
  templateUrl: 'apps-list.component.html',
  styleUrls: ['apps-list.component.less']
})
export class FlogoAppsListComponent implements OnInit {
  @ViewChild('importInput') importInput: ElementRef;
  @Output() appSelected: EventEmitter<App> = new EventEmitter<App>();

  showValidationErrors: boolean;
  importValidationErrors: any;
  showProfileSeclectionDialog = false;

  public applications: Array<App> = [];

  constructor(private apiApplications: AppsApiService,
              private notifications: NotificationsService) {
  }

  ngOnInit() {
    this.listAllApps();
  }

  onSelectApp(event: Event, removeBox: ElementRef, app: App) {
    if (!(event.target === removeBox.nativeElement || removeBox.nativeElement.contains(event.target))) {
      this.emitAppSelected(app);
    }
  }

  onImportFileSelected($event) {
    const file: File = $event.target.files[0];
    const fileReader: FileReader = new FileReader();
    fileReader.onload = (readerEvent) => this.uploadApp(readerEvent);
    fileReader.readAsText(file);
  }

  uploadApp(readerEvent) {
    try {
      const appData = JSON.parse(readerEvent.target.result);
      this.apiApplications.uploadApplication(appData)
        .then((application) => {
          this.applications.push(application);
          this.applications = sortBy(this.applications, 'name');
          this.notifyUser(true);
        }).catch((error) => {
        this.notifyUser(false, error);
      });
    } catch (error) {
      this.notifyUser(false, error);
    }
    this.importInput.nativeElement.value = '';
  }

  notifyUser(isImported: boolean, errorDetails?: Error) {
    let key = 'APP-LIST:BROKEN_RULE_UNKNOWN';

    if (isImported) {
      key = 'APP-LIST:SUCCESSFULLY-IMPORTED';
      this.notifications.success({ key });
    } else {
      this.uploadAppErrorHandler(errorDetails);
    }
  }

  uploadAppErrorHandler(error) {
    let key = 'APP-LIST:BROKEN_RULE_UNKNOWN';

    if (error.name === 'SyntaxError') {
      key = 'APP-LIST:BROKEN_RULE_WRONG_INPUT_JSON_FILE';
    } else {
      if (error[0].status === 400) {
        if (error[0].meta.details) {
          this.importValidationErrors = error[0].meta.details;
          this.showValidationErrors = true;
          key = 'APP-LIST:VALIDATION_ERROR';
        } else {
          key = 'APP-LIST:BROKEN_RULE_NOT_INSTALLED_TRIGGER';
        }
      } else if (error.status === 500) {
        key = 'APP-LIST:INTERNAL_ERROR';
      }
    }
    this.notifications.error({ key });
  }

  resetValidationErrors() {
    this.showValidationErrors = false;
    this.importValidationErrors = [];
  }

  openProfileSelect() {
    this.showProfileSeclectionDialog = true;
  }

  closeModal() {
    this.showProfileSeclectionDialog = false;
  }

  onAdd(profileDetails) {
    this.apiApplications.createNewApp(profileDetails).then((application: App) => {
      this.closeModal();
      this.emitAppSelected(application);
    });
  }

  listAllApps() {
    this.apiApplications.listApps()
      .then((applications: Array<App>) => {
        this.applications = sortBy(applications, 'name');
      });
  }

  remove(application: App) {
    this.apiApplications.deleteApp(application.id)
      .then(() => {
        this.listAllApps();
      });
  }

  private emitAppSelected(app) {
    this.appSelected.emit(app);
  }

}
