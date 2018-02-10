import { Component, ElementRef, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { LanguageService, App } from '@flogo/core';
import { AppsApiService } from '@flogo/core/services/restapi/v2/apps-api.service';
import { notification } from '@flogo/shared/utils';

@Component({
  selector: 'flogo-home-apps-list',
  // moduleId: module.id,
  templateUrl: 'apps-list.component.html',
  styleUrls: ['apps-list.component.less']
})
export class FlogoAppsListComponent implements OnInit {
  @ViewChild('importInput') importInput: ElementRef;
  @Output() onSelectedApp: EventEmitter<App> = new EventEmitter<App>();

  showValidationErrors: boolean;
  importValidationErrors: any;
  showProfileSeclectionDialog = false;

  public applications: Array<App> = [];

  constructor(private translate: LanguageService,
              private apiApplications: AppsApiService) {
  }

  ngOnInit() {
    this.listAllApps();
  }

  onSelectApp(event: Event, removeBox: ElementRef, app: App) {
    if (!(event.target === removeBox.nativeElement || removeBox.nativeElement.contains(event.target))) {
      this.appSelected(app);
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
          this.applications = _.sortBy(this.applications, 'name');
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
    let message = 'APP-LIST:BROKEN_RULE_UNKNOWN';

    if (isImported) {
      message = 'APP-LIST:SUCCESSFULLY-IMPORTED';
      notification(this.translate.instant(message), 'success', 3000);
    } else {
      this.uploadAppErrorHandler(errorDetails);
    }
  }

  uploadAppErrorHandler(error) {
    let message = 'APP-LIST:BROKEN_RULE_UNKNOWN';

    if (error.name === 'SyntaxError') {
      message = 'APP-LIST:BROKEN_RULE_WRONG_INPUT_JSON_FILE';
      notification(this.translate.instant(message), 'error');
    } else {
      if (error[0].status === 400) {
        if (error[0].meta.details) {
          this.importValidationErrors = error;
          this.showValidationErrors = true;
        } else {
          message = 'APP-LIST:BROKEN_RULE_NOT_INSTALLED_TRIGGER';
          notification(this.translate.instant(message), 'error');
        }
      } else if (error.status === 500) {
        message = 'APP-LIST:INTERNAL_ERROR';
        notification(this.translate.instant(message), 'error');
      } else {
        // Last case where we show "Unknown error"
        notification(this.translate.instant(message), 'error');
      }
    }
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
      this.appSelected(application);
    });
  }

  listAllApps() {
    this.apiApplications.listApps()
      .then((applications: Array<App>) => {
        this.applications = _.sortBy(applications, 'name');
      });
  }

  remove(application: App) {
    this.apiApplications.deleteApp(application.id)
      .then(() => {
        this.listAllApps();
      });
  }

  private appSelected(app) {
    this.onSelectedApp.emit(app);
  }

}
