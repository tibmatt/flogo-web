import { Component, EventEmitter, OnChanges, SimpleChange, ViewChild, Input, Output } from '@angular/core';
import { ModalComponent } from 'ng2-bs3-modal/ng2-bs3-modal';
import { RESTAPITriggersService } from '../../../common/services/restapi/triggers-api.service';
import { RESTAPIActivitiesService } from '../../../common/services/restapi/activities-api.service';
import { RESTAPIContributionsService } from '../../../common/services/restapi/v2/contributions.service';
import { FLOGO_PROFILE_TYPE } from '../../../common/constants';
import {
  FLOGO_INSTALLER_STATUS_STANDBY,
  FLOGO_INSTALLER_STATUS_IDLE,
  FLOGO_INSTALLER_STATUS_INSTALL_FAILED,
  FLOGO_INSTALLER_STATUS_INSTALL_SUCCESS,
  FLOGO_INSTALLER_STATUS_INSTALLING
} from '../constants';

@Component({
  selector: 'flogo-installer',
  // moduleId : module.id,
  templateUrl: 'installer.tpl.html',
  styleUrls: ['installer.component.less']
})
export class FlogoInstallerComponent implements OnChanges {

  @ViewChild('installerModal') modal: ModalComponent;

  @Input()
  installType: string;
  @Input()
  isActivated: boolean;
  @Input()
  profileType: FLOGO_PROFILE_TYPE;

  // TODO
  //  may add two-way binding later.
  @Output()
  installTypeChange = new EventEmitter();
  @Output()
  isActivatedChange = new EventEmitter();
  @Output()
  installed = new EventEmitter();

  _installType: string;
  _isActivated: boolean;

  showBlock = {
    standByMode: FLOGO_INSTALLER_STATUS_STANDBY,
    installingMode: FLOGO_INSTALLER_STATUS_INSTALLING,
    installFailedMode: FLOGO_INSTALLER_STATUS_INSTALL_FAILED,
    installSuccessMode: FLOGO_INSTALLER_STATUS_INSTALL_SUCCESS
  };

  query = '';

  _status = FLOGO_INSTALLER_STATUS_IDLE;

  constructor(private _triggersAPIs: RESTAPITriggersService,
              private _activitiesAPIs: RESTAPIActivitiesService,
              private contributionsAPIs: RESTAPIContributionsService) {
    this.init();
  }

  init() {
    console.log('Initialise Flogo Installer Component.');

    this._status = FLOGO_INSTALLER_STATUS_STANDBY;
  }

  ngOnChanges(changes: {
    [key: string]: SimpleChange
  }) {

    if (_.has(changes, 'installType')) {
      this.onInstallTypeChange(changes['installType'].currentValue);
    }

    if (_.has(changes, 'isActivated')) {
      this.onActivatedStatusChange(changes['isActivated'].currentValue);
    }

  }

  onInstallTypeChange(newVal) {
    this._installType = newVal;
  }

  onActivatedStatusChange(newVal) {

    console.log(`Changed in FlogoInstallerComponent: ${newVal}`);

    if (newVal !== this._isActivated) {

      console.log(`Assigned.`);
      this._isActivated = newVal;

      if (this._isActivated) {
        this.openModal();
      }
    }
  }

  openModal(event?: any) {
    console.log('Open Modal.');
    this._status = FLOGO_INSTALLER_STATUS_STANDBY;
    this.modal.open();
  }

  closeModal(event?: any) {
    console.log('Close Modal.');
    this.modal.close();
  }

  onModalCloseOrDismiss(event?: any) {
    console.log('On Modal Close.');
    this._isActivated = false;
    this._status = FLOGO_INSTALLER_STATUS_IDLE;
    this.isActivatedChange.emit(false);
  }

  onInstallAction(url: string) {
    console.group(`[FlogoInstallerComponent] onInstallAction`);
    console.log(`Source URL: ${url} `);

    let installAPI = null;

    if (this.profileType === FLOGO_PROFILE_TYPE.MICRO_SERVICE) {
      if (this._installType === 'trigger') {
        installAPI = this._triggersAPIs.installTriggers.bind(this._triggersAPIs);
      } else if (this._installType === 'activity') {
        installAPI = this._activitiesAPIs.installActivities.bind(this._activitiesAPIs);
      } else {
        console.warn('Unknown installation type.');
        console.groupEnd();
        return;
      }
    } else {
      installAPI = this.contributionsAPIs.installContributions.bind(this.contributionsAPIs);
    }


    const self = this;

    if (_.isFunction(installAPI)) {

      self._status = FLOGO_INSTALLER_STATUS_INSTALLING;

      installAPI([url])
        .then((response) => {
          this.installed.emit(response);
          self._status = FLOGO_INSTALLER_STATUS_INSTALL_SUCCESS;
          console.groupEnd();
          return response;
        })
        .catch((err) => {
          console.error(err);
          self._status = FLOGO_INSTALLER_STATUS_INSTALL_FAILED;
          console.groupEnd();
        });
    } else {
      self._status = FLOGO_INSTALLER_STATUS_INSTALL_FAILED;
    }

  }
}
