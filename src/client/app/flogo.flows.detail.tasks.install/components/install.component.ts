import { Component, EventEmitter, Input } from '@angular/core';
import { FlogoInstallerComponent } from '../../flogo.installer/components/installer.component';
import { FLOGO_PROFILE_TYPE } from '../../../common/constants';

@Component( {
  selector : 'flogo-flows-detail-tasks-install',
  outputs : [ 'onInstalled: flogoOnInstalled' ],
  // moduleId : module.id,
  templateUrl : 'install.tpl.html',
} )
export class FlogoFlowsDetailTasksInstallComponent {
  @Input() profileType: FLOGO_PROFILE_TYPE ;

  public activities : any[] = [];
  public isActivated = false;
  onInstalled = new EventEmitter();

  constructor() {
    this.isActivated = false;
  }

  public openModal() {
    this.isActivated = true;
  }

  public onInstalledAction( response : any ) {
    // bubble the event.
    this.onInstalled.emit( response );
  }
}
