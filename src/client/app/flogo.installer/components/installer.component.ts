import { Component, EventEmitter, OnChanges, SimpleChange, ViewChild } from '@angular/core';
import { Router } from '@angular/router-deprecated';
import { FlogoInstallerCategorySelectorComponent } from '../../flogo.installer.category-selector/components/category-selector.component';
import { MODAL_DIRECTIVES, ModalComponent } from 'ng2-bs3-modal/ng2-bs3-modal';
import { FlogoInstallerTriggerComponent } from '../../flogo.installer.trigger/components/trigger-installer.component';
import { FlogoInstallerActivityComponent } from '../../flogo.installer.activity/components/activity-installer.component';
import { FlogoInstallerSearchComponent } from '../../flogo.installer.search/components/search.component';

const ACTIVITY_TITLE = 'Download Tiles';
const TRIGGER_TITLE = 'Download Triggers';

@Component( {
  selector : 'flogo-installer',
  moduleId : module.id,
  directives : [
    MODAL_DIRECTIVES,
    FlogoInstallerSearchComponent,
    FlogoInstallerCategorySelectorComponent,
    FlogoInstallerActivityComponent,
    FlogoInstallerTriggerComponent
  ],
  templateUrl : 'installer.tpl.html',
  inputs : [ 'installType: flogoInstallType', 'isActivated: flogoIsActivated' ],
  outputs : [ 'installTypeUpdate: flogoInstallTypeChange', 'isActivatedUpdate: flogoIsActivatedChange' ],
  styleUrls : [ 'installer.component.css' ]
} )
export class FlogoInstallerComponent implements OnChanges {

  @ViewChild( 'installerModal' ) modal : ModalComponent;

  installType : string;
  _installType : string;

  isActivated : boolean;
  _isActivated : boolean;
  isActivatedUpdate = new EventEmitter();

  _query = '';
  _title = '';

  // TODO
  //  may add two-way binding later.
  installTypeUpdate = new EventEmitter();

  constructor( private _router : Router ) {
    this.init();
  }

  init() {
    console.log( 'Initialise Flogo Installer Component.' );
  }

  ngOnChanges( changes : {
    [key : string] : SimpleChange
  } ) {

    if ( _.has( changes, 'installType' ) ) {
      this.onInstallTypeChange( changes[ 'installType' ].currentValue );
    }

    if ( _.has( changes, 'isActivated' ) ) {
      this.onActivatedStatusChange( changes[ 'isActivated' ].currentValue );
    }

  }

  onInstallTypeChange( newVal ) {
    this._installType = newVal;

    switch(this._installType) {
      case 'activity':
        this._title = ACTIVITY_TITLE;
        break;
      case 'trigger':
        this._title = TRIGGER_TITLE;
        break;
      default:
        this._title = 'Install';
        break;
    }
  }

  onActivatedStatusChange( newVal ) {

    console.log( `Changed in FlogoInstallerComponent: ${newVal}` );

    if ( newVal !== this._isActivated ) {

      console.log( `Assigned.` );
      this._isActivated = newVal;

      if ( this._isActivated ) {
        this.openModal();
      }
    }
  }

  openModal() {
    console.log( 'Open Modal.' );
    this.modal.open();
  }

  closeModal() {
    console.log( 'Close Modal.' );
    this.modal.close();
  }

  onModalCloseOrDismiss() {
    console.log( 'On Modal Close.' );
    this._isActivated = false;
    this.isActivatedUpdate.emit( false );
  }
}
