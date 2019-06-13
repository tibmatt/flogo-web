import {
  Component,
  EventEmitter,
  Input,
  Output,
  OnChanges,
  SimpleChange,
} from '@angular/core';
import { FLOGO_INSTALLER_STATUS_INSTALLING } from '../constants';

@Component({
  selector: 'flogo-contrib-url-installer',
  templateUrl: 'url-installer.component.html',
  styleUrls: ['url-installer.component.less'],
})
export class FlogoUrlInstallerComponent implements OnChanges {
  @Input()
  sourceUrl: string;
  @Input()
  status: string;
  @Output()
  install = new EventEmitter();
  @Output()
  cancel = new EventEmitter();
  disableInstall: boolean;

  constructor() {
    this.disableInstall = false;
  }

  ngOnChanges(changes: { [key: string]: SimpleChange }): any {
    if (changes.status) {
      this.onInstallerStatusChange(changes.status.currentValue);
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
