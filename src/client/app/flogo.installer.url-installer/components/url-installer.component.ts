import { Component, EventEmitter, Input, Output, OnChanges, SimpleChange } from '@angular/core';
import { FLOGO_INSTALLER_STATUS_INSTALLING } from '../../flogo.installer/constants';
import { TranslateService } from 'ng2-translate/ng2-translate';

@Component({
  selector: 'flogo-installer-url',
  templateUrl: 'url-installer.tpl.html',
  styleUrls: ['url-installer.component.less']
})
export class FlogoInstallerUrlComponent implements OnChanges {

  @Input()
  installType: string;
  @Input()
  sourceUrl: string;
  @Input()
  status: string;
  @Output()
  install = new EventEmitter();
  @Output()
  cancel = new EventEmitter();
  disableInstall: boolean;

  constructor(translate: TranslateService) {
    this.disableInstall = false;
  }

  ngOnChanges(changes: {
    [key: string]: SimpleChange
  }): any {

    if (_.has(changes, 'status')) {
      this.onInstallerStatusChange(changes['status'].currentValue);
    }

  }

  onSourceUrlChange(newUrl: string) {
    this.sourceUrl = newUrl;
  }

  onInstallAction(evt: any) {
    if (!this.disableInstall) {
      this.install.emit(this.sourceUrl);
    }
  }

  onCancelAction(evt: any) {
    this.cancel.emit();
  }

  onInstallerStatusChange(status: string) {
    if (status === FLOGO_INSTALLER_STATUS_INSTALLING) {
      this.disableInstall = true;
    } else {
      this.disableInstall = false;
    }
  }
}
