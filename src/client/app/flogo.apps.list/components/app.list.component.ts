import {Component, EventEmitter, Input, Output, OnInit, OnChanges, SimpleChanges} from '@angular/core';
import {FlogoModal} from '../../../common/services/modal.service';
import {IFlogoApplicationModel} from '../../../common/application.model';
import {TranslateService} from 'ng2-translate/ng2-translate';
import {RESTAPIApplicationsService} from '../../../common/services/restapi/applications-api.service';


@Component({
  selector: 'flogo-apps-list',
  moduleId: module.id,
  templateUrl: 'app.list.tpl.html',
  styleUrls: ['app.list.css']
})
export class FlogoAppListComponent implements OnInit, OnChanges {
  @Input() currentApp: IFlogoApplicationModel;
  @Output() onSelectedApp: EventEmitter<IFlogoApplicationModel> = new EventEmitter<IFlogoApplicationModel>();
  @Output() onAddedApp: EventEmitter<IFlogoApplicationModel> = new EventEmitter<IFlogoApplicationModel>();
  @Output() onDeletedApp: EventEmitter<IFlogoApplicationModel> = new EventEmitter<IFlogoApplicationModel>();

  public applications: Array<IFlogoApplicationModel> = [];

  constructor(public flogoModal: FlogoModal,
              public translate: TranslateService,
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

  onSelectApp(app: IFlogoApplicationModel) {
    this.onSelectedApp.emit(app);
  }

  confirmDelete(event:Event, app: IFlogoApplicationModel) {
    // TODO: i18n
    event.stopPropagation();
    this.flogoModal.confirmDelete('Are you sure you want to delete ' + app.name + ' application?').then((res) => {
      if (res) {
        this.remove(app);
      }
    });
  }

  onAdd(event) {
    this.apiApplications.createNewApp()
      .then((application: IFlogoApplicationModel) => {
        this.onAddedApp.emit(application);
        this.onSelectApp(application);
      }).then(() => this.listAllApps());
  }

  listAllApps() {
    this.apiApplications.getAllApps()
      .then((applications: Array<IFlogoApplicationModel>) => {
        this.applications = applications;
      })
  }

  private remove(application: IFlogoApplicationModel) {
    this.apiApplications.deleteApp(application.id)
      .then(() => {
        this.listAllApps();
        this.onDeletedApp.emit(application);
      })
  }

}
