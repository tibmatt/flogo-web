import { Component, EventEmitter, Input } from '@angular/core';
import { FLOGO_PROFILE_TYPE } from '@flogo/core/constants';

@Component( {
  selector : 'flogo-flow-task-add-install',
  /* tslint:disable-next-line:use-output-property-decorator */
  outputs: [ 'onInstalled: flogoOnInstalled' ],
  templateUrl : 'install.component.html',
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
