import { Component, EventEmitter, OnChanges, SimpleChange } from '@angular/core';

const PLACEHOLDER = {
  activity : `Install activity from URL.`,
  trigger : `Install trigger from URL.`
};

@Component( {
  selector : 'flogo-installer-url',
  moduleId : module.id,
  directives : [],
  inputs : [ 'installType: flogoInstallType' ],
  outputs : [ 'onInstallEvent: flogoOnInstall' ],
  templateUrl : 'url-installer.tpl.html',
  styleUrls : [ 'url-installer.component.css' ]
} )
export class FlogoInstallerUrlComponent implements OnChanges {

  private installType : string;
  private placeholder : string;
  private sourceUrl : string;
  private onInstallEvent = new EventEmitter();

  constructor() {

  }

  ngOnChanges( changes : {
    [key : string] : SimpleChange
  } ) : any {

    if ( _.has( changes, 'installType' ) ) {
      let currentValue = changes[ 'installType' ].currentValue;

      this.onInstallTypeChange();
    }

  }

  onInstallTypeChange() {
    if ( this.installType === 'trigger' ) {
      this.placeholder = PLACEHOLDER.trigger;
    } else {
      // by default, display the activity placeholder.
      this.placeholder = PLACEHOLDER.activity;
    }
  }

  onSourceUrlChange( newUrl : string ) {
    this.sourceUrl = newUrl;
  }

  onInstallAction( evt : any ) {
    this.onInstallEvent.emit( this.sourceUrl );
  }
}
