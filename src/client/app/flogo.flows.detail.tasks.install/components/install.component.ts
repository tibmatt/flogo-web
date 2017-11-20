import { Component, EventEmitter, Input } from '@angular/core';
import { FLOGO_PROFILE_TYPE } from '../../../common/constants';

@Component( {
  selector : 'flogo-flows-detail-tasks-install',
  /* tslint:disable-next-line:use-output-property-decorator */
  outputs: [ 'onInstalled: flogoOnInstalled' ],
  templateUrl : 'install.tpl.html',
} )
export class FlogoFlowsDetailTasksInstallComponent {
  @Input() profileType: FLOGO_PROFILE_TYPE ;

  public activities: any[] = [];
  public isActivated = false;
  onInstalled = new EventEmitter();

  constructor() {
    this.isActivated = false;
  }

  public openModal() {
    this.isActivated = true;
  }

  public onInstalledAction( response: any ) {
    // bubble the event.
    this.onInstalled.emit( response );
  }
}
