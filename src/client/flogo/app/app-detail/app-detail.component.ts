import { sortBy, snakeCase } from 'lodash';
import { differenceInSeconds } from 'date-fns';

import {
  Component, Input, Output, SimpleChanges, OnChanges, OnInit, ViewChild, EventEmitter, InjectionToken,
} from '@angular/core';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import {LanguageService, FlowSummary, Trigger, ERROR_CODE, CONTRIB_REF_PLACEHOLDER} from '@flogo/core';
import { FLOGO_PROFILE_TYPE } from '@flogo/core/constants';
import { SanitizeService } from '@flogo/core/services/sanitize.service';
import {RESTAPIContributionsService} from '@flogo/core/services/restapi/v2/contributions.service';
import {
AppDetailService, ApplicationDetail, ApplicationDetailState, FlowGroup, App, TriggerGroup
} from '../core';
import { FlogoNewFlowComponent } from '../new-flow/new-flow.component';
import {
  ExportFlowsData,
  FlogoExportFlowsComponent
} from '../export-flows/export-flows.component';
import { TriggerShimBuildComponent } from '../shim-trigger/shim-trigger.component';

import {ShimTriggerBuildApiService} from '@flogo/core/services/restapi/v2/shim-trigger-build-api.service';
import {ConfirmationResult} from '@flogo/core/confirmation';
import {ConfirmationModalService} from '@flogo/core/confirmation/confirmation-modal/confirmation-modal.service';

import { NotificationsService } from '@flogo/core/notifications';
import {ModalService} from '@flogo/core/modal/modal.service';


const MAX_SECONDS_TO_ASK_APP_NAME = 5;

@Component({
  selector: 'flogo-apps-details-application',
  templateUrl: 'app-detail.component.html',
  styleUrls: ['app-detail.component.less']
})
export class FlogoApplicationDetailComponent implements OnChanges, OnInit {
  @ViewChild(FlogoNewFlowComponent) addFlow: FlogoNewFlowComponent;
  @ViewChild('shimTriggersModal') shimTriggersBuild: TriggerShimBuildComponent;
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
  isBuilding: boolean;
  isViewsDropdownShown = false;
  isDetailsMenuOpen = false;

  buildOptions = [
    {label: 'Darwin/amd64', os: 'darwin', arch: 'amd64'},
    {label: 'Linux/amd64', os: 'linux', arch: 'amd64'},
    {label: 'Linux/386', os: 'linux', arch: '386'},
    {label: 'Linux/arm', os: 'linux', arch: 'arm'},
    {label: 'Linux/arm64', os: 'linux', arch: 'arm64'},
    {label: 'Windows/amd64', os: 'windows', arch: 'amd64'},
  ];

  shimTriggerOptions = [];
  shimTriggersList = [];
  isExportBoxShown = false;
  downloadLink: string;

  PROFILE_TYPES: typeof FLOGO_PROFILE_TYPE = FLOGO_PROFILE_TYPE;

  constructor(public translate: LanguageService,
              private appDetailService: AppDetailService,
              private confirmationModalService: ConfirmationModalService,
              private sanitizer: SanitizeService,
              private contributionService: RESTAPIContributionsService,
              private shimTriggersApiService: ShimTriggerBuildApiService,
              private notificationsService: NotificationsService,
              private modalService: ModalService
  ) {
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
      this.downloadLink = this.appDetailService.getDownloadLink(this.application.id);
      // this.flows = this.extractFlows();
      this.createFlowGroups();
      this.createTriggerGroups();
      if (this.application.profileType === FLOGO_PROFILE_TYPE.MICRO_SERVICE) {
        this.shimTriggerOptions = [];
        this.getShimTriggerBuildOptions();
      }
      const prevValue = change.previousValue;
      const isDifferentApp = !prevValue || !prevValue.app || prevValue.app.id !== this.application.id;
      if (isDifferentApp) {
        this.appUpdated();
      } else {
        this.appDetailChanged();
      }
    }
  }

  private createFlowGroups() {
    const flowGroups = this.application ? this.application.flowGroups : null;
    this.flowGroups = flowGroups ? [...this.application.flowGroups] : [];
    this.flowGroups = sortBy(this.flowGroups, g => g.trigger ? g.trigger.name.toLocaleLowerCase() : '');
  }

  private createTriggerGroups() {
    const triggerGroups = this.application ? this.application.triggerGroups : null;
    this.triggerGroups = triggerGroups ? [...this.application.triggerGroups] : [];
    this.triggerGroups = sortBy(this.triggerGroups, g => g.triggers ? g.flow.name.toLocaleLowerCase() : '');
  }

  appExporter(isLegacyExport: boolean = false) {
    return () => this.appDetailService.toEngineSpec(isLegacyExport)
      .then(engineApp => {
        const appName = snakeCase(engineApp.name);
        const fileNameSuffix = isLegacyExport ? '_legacy' : '';
        return [{
          fileName: `${appName}${fileNameSuffix}.json`,
          data: engineApp
        }];
      }).catch(errRsp => {
        this.closeExportBox();
        if (errRsp && errRsp.errors && errRsp.errors[0] && errRsp.errors[0].code === ERROR_CODE.HAS_SUBFLOW) {
          this.notificationsService.error({ key: 'DETAILS-EXPORT:CANNOT-EXPORT' });
        } else {
          console.error(errRsp.errors);
          this.notificationsService.error({ key: 'DETAILS-EXPORT:ERROR_UNKNOWN' });
        }
      });
  }

  openCreateFlow() {
    this.addFlow.open();
  }

  buildApp({ os, arch }) {
    this.closeBuildBox();
    this.handleBuildDownload(this.appDetailService.build(this.application.id, { os, arch }));
  }

  onShimTriggerSelection(selectedTrigger) {
    this.buildShimTrigger(selectedTrigger);
  }

  buildShimTrigger(selectedTriggerDetails) {
    this.shimTriggersBuild.closeModal();
    this.handleBuildDownload(this.shimTriggersApiService.buildShimTrigger(selectedTriggerDetails));
  }

  openCreateFlowFromTrigger(trigger: Trigger) {
    this.addFlow.open(trigger.id);
  }

  onClickAddDescription(event) {
    this.isDescriptionInEditMode = true;
  }

  openExportFlow() {
    const flows = this.application.actions;
    const isLegacyExport = this.application.profileType === FLOGO_PROFILE_TYPE.DEVICE;
    return this.modalService.openModal<ExportFlowsData>(FlogoExportFlowsComponent, {flows, isLegacyExport});
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
    this.closeDetailsMenu();
    this.translate.get(['APP-DETAIL:CONFIRM_DELETE', 'MODAL:CONFIRM-DELETION'], {appName: application.name}).pipe(
      switchMap(translation => {
        return this.confirmationModalService.openModal({
          title: translation['MODAL:CONFIRM-DELETION'],
          textMessage: translation['APP-DETAIL:CONFIRM_DELETE']
        }).result;
      })
    ).subscribe(result => {
      if (result === ConfirmationResult.Confirm) {
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

  showShimTriggerList(ref) {
    this.shimTriggersList = this.flowGroups.filter(flowGroup => (flowGroup.trigger) && (flowGroup.trigger.ref === ref));
    if (ref === CONTRIB_REF_PLACEHOLDER.REF_LAMBDA && this.shimTriggersList.length === 1) {
      this.buildShimTrigger({triggerId: this.shimTriggersList[0].trigger.id});
    } else {
      this.shimTriggersBuild.openModal();
    }
    this.closeBuildBox();
  }

  toggleExportBox() {
    this.isExportBoxShown = !this.isExportBoxShown;
  }

  closeExportBox() {
    this.isExportBoxShown = false;
  }

  toggleViewsDropdown() {
    this.isViewsDropdownShown = !this.isViewsDropdownShown;
  }

  closeViewsDropdown() {
    this.isViewsDropdownShown = false;
  }
  showDetailsView(viewType: string) {
    this.isFlowsViewActive = viewType === 'flows';
    this.selectedViewTranslateKey = this.isFlowsViewActive ? 'DETAILS-VIEW-MENU:FLOWS' : 'DETAILS-VIEW-MENU:TRIGGERS';
    this.isViewsDropdownShown = false;
  }

  toggleDetailsMenu() {
    this.isDetailsMenuOpen = !this.isDetailsMenuOpen;
  }

  closeDetailsMenu() {
    this.isDetailsMenuOpen = false;
  }

  private handleBuildDownload(download: Observable<any>) {
    const restoreBuildFlag = () => this.isBuilding = false;
    const handleBuildError = () => {
      this.notificationsService.error({ key: 'DETAILS:BUILD-ERROR' });
      restoreBuildFlag();
    };

    this.isBuilding = true;
    download.subscribe(restoreBuildFlag, handleBuildError);
  }

  private appUpdated() {
    this.isDescriptionInEditMode = false;

    this.editableName = this.application.name;
    this.editableDescription = this.application.description;

    this.isNameInEditMode = false;
    this.isNewApp = !this.application.updatedAt;
    if (this.isNewApp) {
      const secondsSinceCreation = differenceInSeconds(Date.now(), this.application.createdAt);
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

  private getShimTriggerBuildOptions() {
    const flowGroupsMap = this.flowGroups.map(flowGroup => {
      return {
        triggerRef: flowGroup.trigger ? flowGroup.trigger.ref : null
      };
    });
    this.contributionService.getShimContributionDetails(this.application.profileType).then(shimmableTriggersDetails => {
      shimmableTriggersDetails.forEach(shimmableTriggerDetail => {
        const shimmableTrigger = flowGroupsMap.find(flowGroupMap => flowGroupMap.triggerRef === shimmableTriggerDetail.ref);
        if (!!shimmableTrigger) {
          switch (shimmableTriggerDetail.ref) {
            case CONTRIB_REF_PLACEHOLDER.REF_LAMBDA:
              this.shimTriggerOptions.push({label: this.translate.instant('TRIGGER-SHIM:SERVERLESS-APP'), ref: shimmableTriggerDetail.ref});
              break;
            case CONTRIB_REF_PLACEHOLDER.REF_CLI:
              this.shimTriggerOptions.push({label: this.translate.instant('TRIGGER-SHIM:CLI-APP'), ref: shimmableTriggerDetail.ref});
              break;
            default:
              this.shimTriggerOptions.push({label: shimmableTriggerDetail.name, ref: shimmableTriggerDetail.ref});
              break;
          }
        }
      });
    });
  }

}
