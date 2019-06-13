import {
  Component,
  EventEmitter,
  OnChanges,
  SimpleChange,
  ViewChild,
  Input,
  Output,
} from '@angular/core';
import { has } from 'lodash';
import { BsModalComponent } from 'ng2-bs3-modal';
import { ContributionsService } from '@flogo-web/lib-client/core';

import {
  FLOGO_INSTALLER_STATUS_STANDBY,
  FLOGO_INSTALLER_STATUS_IDLE,
  FLOGO_INSTALLER_STATUS_INSTALL_FAILED,
  FLOGO_INSTALLER_STATUS_INSTALL_SUCCESS,
  FLOGO_INSTALLER_STATUS_INSTALLING,
} from './constants';
import { ContribInstallerService } from './contrib-installer.service';

@Component({
  selector: 'flogo-contrib-installer',
  templateUrl: 'contrib-installer.component.html',
  styleUrls: ['contrib-installer.component.less'],
})
export class FlogoInstallerComponent implements OnChanges {
  @ViewChild('installerModal') modal: BsModalComponent;

  @Input()
  isActivated: boolean;

  @Output()
  isActivatedChange = new EventEmitter();
  @Output()
  installed = new EventEmitter();

  _isActivated: boolean;

  showBlock = {
    standByMode: FLOGO_INSTALLER_STATUS_STANDBY,
    installingMode: FLOGO_INSTALLER_STATUS_INSTALLING,
    installFailedMode: FLOGO_INSTALLER_STATUS_INSTALL_FAILED,
    installSuccessMode: FLOGO_INSTALLER_STATUS_INSTALL_SUCCESS,
  };

  query = '';

  _status = FLOGO_INSTALLER_STATUS_IDLE;

  constructor(
    private contributionsAPIs: ContributionsService,
    private contribInstallerService: ContribInstallerService
  ) {
    this.init();
  }

  init() {
    this._status = FLOGO_INSTALLER_STATUS_STANDBY;
  }

  ngOnChanges(changes: { [key: string]: SimpleChange }) {
    if (has(changes, 'isActivated')) {
      this.onActivatedStatusChange(changes['isActivated'].currentValue);
    }
  }

  onActivatedStatusChange(newVal) {
    if (newVal !== this._isActivated) {
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

    const self = this;

    self._status = FLOGO_INSTALLER_STATUS_INSTALLING;

    this.contributionsAPIs
      .installContributions({
        url,
      })
      .toPromise()
      .then(result => {
        self._status = FLOGO_INSTALLER_STATUS_INSTALL_SUCCESS;
        console.groupEnd();
        return this.contributionsAPIs.getContributionDetails(result.ref);
      })
      .then(contribDetails => {
        this.contribInstallerService.afterContribInstalled(contribDetails);
        this.installed.emit(contribDetails);
      })
      .catch(err => {
        console.error(err);
        self._status = FLOGO_INSTALLER_STATUS_INSTALL_FAILED;
        console.groupEnd();
      });
  }
}
