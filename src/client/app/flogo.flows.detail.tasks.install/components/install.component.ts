import { Component, EventEmitter } from '@angular/core';

@Component( {
  selector : 'flogo-flows-detail-tasks-install',
  outputs : [ 'onInstalled: flogoOnInstalled' ],
  moduleId : module.id,
  templateUrl : 'install.tpl.html',
} )
export class FlogoFlowsDetailTasksInstallComponent {

  public activities : any[] = [];
  private isActivated = false;
  onInstalled = new EventEmitter();

  constructor() {
    this.isActivated = false;
  }

  private openModal() {
    this.isActivated = true;
  }

  private onInstalledAction( response : any ) {
    // bubble the event.
    this.onInstalled.emit( response );
  }
}
