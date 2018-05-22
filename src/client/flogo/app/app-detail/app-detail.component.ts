import * as _ from 'lodash';

import { Component, Input, Output, SimpleChanges, OnChanges, OnInit, ViewChild, EventEmitter } from '@angular/core';
import {LanguageService, FlowSummary, Trigger, ERROR_CODE} from '@flogo/core';
import { FlogoModal } from '@flogo/core/services/modal.service';
import { FLOGO_PROFILE_TYPE } from '@flogo/core/constants';
import { SanitizeService } from '@flogo/core/services/sanitize.service';

import {
  AppDetailService, ApplicationDetail, ApplicationDetailState, FlowGroup, App, TriggerGroup
} from '../core';
import { FlogoNewFlowComponent } from '../new-flow/new-flow.component';
import { FlogoExportFlowsComponent } from '../export-flows/export-flows.component';
import { diffDates, notification } from '../../shared/utils';

const MAX_SECONDS_TO_ASK_APP_NAME = 5;

@Component({
  selector: 'flogo-apps-details-application',
  templateUrl: 'app-detail.component.html',
  styleUrls: ['app-detail.component.less']
})
export class FlogoApplicationDetailComponent implements OnChanges, OnInit {
  @ViewChild(FlogoNewFlowComponent) addFlow: FlogoNewFlowComponent;
  @ViewChild('exportFlowModal') exportFlow: FlogoExportFlowsComponent;
  @Input() appDetail: ApplicationDetail;

  @Output() flowSelected: EventEmitter<FlowSummary> = new EventEmitter<FlowSummary>();
  @Output() flowAdded: EventEmitter<{ name: string, description?: string, triggerId?: string }> = new EventEmitter<FlowSummary>();
  @Output() flowDeleted: EventEmitter<App> = new EventEmitter<App>();

  application: App;
  state: ApplicationDetailState;

  isNameInEditMode: boolean;
  autofocusName = true;
  editableName: string;

  isDescriptionInEditMode: boolean;
  editableDescription: string;

  flowGroups: Array<FlowGroup> = [];
  triggerGroups: Array<TriggerGroup> = [];
  flows: Array<FlowSummary> = [];
  isFlowsViewActive: boolean;
  selectedViewTranslateKey: string;

  isNewApp = false;

  isBuildBoxShown = false;
  buildOptions = [
    { label: 'Darwin/amd64', os: 'darwin', arch: 'amd64' },
    { label: 'Linux/amd64', os: 'linux', arch: 'amd64' },
    { label: 'Linux/386', os: 'linux', arch: '386' },
    { label: 'Linux/arm', os: 'linux', arch: 'arm' },
    { label: 'Linux/arm64', os: 'linux', arch: 'arm64' },
    { label: 'Windows/amd64', os: 'windows', arch: 'amd64' },
  ];

  isExportBoxShown = false;
  downloadLink: string;

  PROFILE_TYPES: typeof FLOGO_PROFILE_TYPE = FLOGO_PROFILE_TYPE;

  constructor(public translate: LanguageService,
              private appDetailService: AppDetailService,
              public flogoModal: FlogoModal,
              private sanitizer: SanitizeService) {
  }

  ngOnInit() {
    this.isDescriptionInEditMode = false;
    this.isNameInEditMode = false;
    this.isFlowsViewActive = true;
    this.selectedViewTranslateKey = 'DETAILS-VIEW-MENU:FLOWS';
  }

  ngOnChanges(changes: SimpleChanges) {
    const change = changes['appDetail'];
    if (change.currentValue) {
      this.application = this.appDetail.app;
      this.state = this.appDetail.state;
      const flowGroups = this.application ? this.application.flowGroups : null;
      this.flowGroups = flowGroups ? [...this.application.flowGroups] : [];
      this.flowGroups = _.sortBy(this.flowGroups, g => g.trigger ? g.trigger.name.toLocaleLowerCase() : '');
      const triggerGroups = this.application ? this.application.triggerGroups : null;
      this.triggerGroups = triggerGroups ? [...this.application.triggerGroups] : [];
      this.triggerGroups = _.sortBy(this.triggerGroups, g => g.triggers ? g.flow.name.toLocaleLowerCase() : '');
      this.downloadLink = this.appDetailService.getDownloadLink(this.application.id);
      // this.flows = this.extractFlows();

      const prevValue = change.previousValue;
      const isDifferentApp = !prevValue || !prevValue.app || prevValue.app.id !== this.application.id;
      if (isDifferentApp) {
        this.appUpdated();
      } else {
        this.appDetailChanged();
      }
    }
  }

  appExporter(isLegacyExport: boolean = false) {
    return () => this.appDetailService.toEngineSpec(isLegacyExport)
      .then(engineApp => {
        const appName = _.snakeCase(engineApp.name);
        const fileNameSuffix = isLegacyExport ? '_legacy' : '';
        return [{
          fileName: `${appName}${fileNameSuffix}.json`,
          data: engineApp
        }];
      }).catch(errRsp => {
        this.closeExportBox();
        if (errRsp.errors[0].code === ERROR_CODE.HAS_SUBFLOW) {
          this.translate.get('DETAILS-EXPORT:CANNOT-EXPORT').toPromise()
            .then(msg => notification(msg, 'error'));
        } else {
          console.error(errRsp.errors);
          this.translate.get('DETAILS-EXPORT:ERROR_UNKNOWN').toPromise()
            .then(msg => notification(msg, 'error'));
        }
    });
  }

  openCreateFlow() {
    this.addFlow.open();
  }

  openCreateFlowFromTrigger(trigger: Trigger) {
    this.addFlow.open(trigger.id);
  }

  onClickAddDescription(event) {
    this.isDescriptionInEditMode = true;
  }

  openExportFlow() {
    this.exportFlow.openExport();
  }

  onNameSave() {
    let editableName = this.editableName || '';
    editableName = editableName.trim();
    if (!editableName) {
      return;
    }
    editableName = this.sanitizer.sanitizeHTMLInput(editableName);
    this.isNameInEditMode = false;
    this.appDetailService.update('name', editableName);
  }

  onNameCancel() {
    this.isNameInEditMode = false;
    this.appDetailService.cancelUpdate('name');
    this.editableName = this.application.name;
  }

  onDescriptionSave() {
    this.isDescriptionInEditMode = false;
    this.editableDescription = this.sanitizer.sanitizeHTMLInput(this.editableDescription);
    this.appDetailService.update('description', this.editableDescription);
  }

  onSaveDeviceSettings(settings: any[]) {
    if (!this.application.device) {
      this.application.device = {};
    }

    this.application.device.settings = settings;
    this.appDetailService.update('device', this.application.device);
  }

  onDescriptionCancel() {
    this.isDescriptionInEditMode = false;
    this.appDetailService.cancelUpdate('description');
    this.editableDescription = this.application.description;
  }

  onClickLabelDescription() {
    this.isDescriptionInEditMode = true;
  }

  onClickLabelName() {
    this.isNameInEditMode = true;
  }

  onFlowSelected(flow) {
    this.flowSelected.emit(flow);
  }

  onFlowDelete(eventData) {
    this.flowDeleted.emit(eventData);
  }

  onFlowAdd(newFlow) {
    this.flowAdded.emit(newFlow);
  }

  onDeleteApp(application) {
    const message = this.translate.instant('APP-DETAIL:CONFIRM_DELETE', { appName: application.name });
    this.flogoModal.confirmDelete(message).then((res) => {
      if (res) {
        this.appDetailService.deleteApp();
      }
    });
  }

  toggleBuildBox() {
    this.isBuildBoxShown = !this.isBuildBoxShown;
  }

  closeBuildBox() {
    this.isBuildBoxShown = false;
  }
  toggleExportBox() {
    this.isExportBoxShown = !this.isExportBoxShown;
  }

  closeExportBox() {
    this.isExportBoxShown = false;
  }

  showDetailsView(viewType: string) {
    this.isFlowsViewActive = viewType === 'flows';
    this.selectedViewTranslateKey = this.isFlowsViewActive ? 'DETAILS-VIEW-MENU:FLOWS' : 'DETAILS-VIEW-MENU:TRIGGERS';
  }

  private appUpdated() {
    this.isDescriptionInEditMode = false;

    this.editableName = this.application.name;
    this.editableDescription = this.application.description;

    this.isNameInEditMode = false;
    this.isNewApp = !this.application.updatedAt;
    if (this.isNewApp) {
      const secondsSinceCreation = diffDates(Date.now(), this.application.createdAt, 'seconds');
      this.isNewApp = secondsSinceCreation <= MAX_SECONDS_TO_ASK_APP_NAME;
      this.isNameInEditMode = this.isNewApp;
    }

  }

  private appDetailChanged() {
    if (this.state.name.hasErrors) {
      this.isNameInEditMode = true;
      this.autofocusName = false;
      setTimeout(() => this.autofocusName = true, 100);
    } else if (!this.state.name.pendingSave) {
      this.editableName = this.application.name;
    }
  }

  private extractFlows() {
    return _.clone(this.application.flows || []);
  }
}
