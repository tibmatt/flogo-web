import { Component, EventEmitter, OnChanges, SimpleChange, ViewChild, Input, Output } from '@angular/core';
import { BsModalComponent } from 'ng2-bs3-modal';
import { RESTAPIContributionsService } from '@flogo/core/services/restapi/v2/contributions.service';
import { FLOGO_PROFILE_TYPE } from '@flogo/core/constants';
import {
  FLOGO_INSTALLER_STATUS_STANDBY,
  FLOGO_INSTALLER_STATUS_IDLE,
  FLOGO_INSTALLER_STATUS_INSTALL_FAILED,
  FLOGO_INSTALLER_STATUS_INSTALL_SUCCESS,
  FLOGO_INSTALLER_STATUS_INSTALLING
} from './constants';

@Component({
  selector: 'flogo-flow-installer',
  // moduleId : module.id,
  templateUrl: 'installer.component.html',
  styleUrls: ['installer.component.less']
})
export class FlogoInstallerComponent implements OnChanges {

  @ViewChild('installerModal') modal: BsModalComponent;

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

  constructor(private contributionsAPIs: RESTAPIContributionsService) {
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
    if (this._installType !== 'trigger' && this._installType !== 'activity') {
      console.warn('Unknown installation type.');
      console.groupEnd();
      return;
    }

    console.group(`[FlogoInstallerComponent] onInstallAction`);
    console.log(`Source URL: ${url} `);

    const installAPI = this.contributionsAPIs.installContributions.bind(this.contributionsAPIs);

    const self = this;


    self._status = FLOGO_INSTALLER_STATUS_INSTALLING;

    this.contributionsAPIs.installContributions({
      profileType: this.profileType,
      installType: this._installType,
      url
    }).then((response) => {
      this.installed.emit(response);
      self._status = FLOGO_INSTALLER_STATUS_INSTALL_SUCCESS;
      console.groupEnd();
      return response;
    }).catch((err) => {
      console.error(err);
      self._status = FLOGO_INSTALLER_STATUS_INSTALL_FAILED;
      console.groupEnd();
    });
  }
}
