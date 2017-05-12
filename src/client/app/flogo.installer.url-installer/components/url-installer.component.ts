import { Component, EventEmitter, OnChanges, SimpleChange } from '@angular/core';
import { FLOGO_INSTALLER_STATUS_INSTALLING } from '../../flogo.installer/constants';
import { TranslateService } from 'ng2-translate/ng2-translate';

@Component( {
  selector : 'flogo-installer-url',
  moduleId : module.id,
  inputs : [ 'status: flogoInstallerStatus'  ],
  outputs : [ 'onInstallEvent: flogoOnInstall', 'onCancelEvent: flogoOnCancel' ],
  templateUrl : 'url-installer.tpl.html',
  styleUrls : [ 'url-installer.component.css' ]
} )
export class FlogoInstallerUrlComponent implements OnChanges {

  installType : string;
  sourceUrl : string;
  onInstallEvent = new EventEmitter();
  onCancelEvent = new EventEmitter();
  disableInstall : boolean;
  status : string;

  constructor(translate: TranslateService) {
    this.disableInstall = false;
  }

  ngOnChanges( changes : {
    [key : string] : SimpleChange
  } ) : any {

    if ( _.has( changes, 'status' ) ) {
      this.onInstallerStatusChange( changes[ 'status' ].currentValue );
    }

  }

  onSourceUrlChange( newUrl : string ) {
    this.sourceUrl = newUrl;
  }

  onInstallAction( evt : any ) {
    if (!this.disableInstall) {
      this.onInstallEvent.emit( this.sourceUrl );
    }
  }

  onCancelAction( evt : any ) {
    this.onCancelEvent.emit();
  }

  onInstallerStatusChange( status: string) {
    if (status === FLOGO_INSTALLER_STATUS_INSTALLING) {
      this.disableInstall = true;
    } else {
      this.disableInstall = false;
    }
  }
}
