import { Component, EventEmitter } from '@angular/core';
import { FlogoInstallerComponent } from '../../flogo.installer/components/installer.component';
import { TranslatePipe, TranslateService } from 'ng2-translate/ng2-translate';

@Component( {
  selector : 'flogo-flows-detail-tasks-install',
  directives : [ FlogoInstallerComponent ],
  outputs : [ 'onInstalled: flogoOnInstalled' ],
  moduleId : module.id,
  pipes: [TranslatePipe],
  templateUrl : 'install.tpl.html',
} )
export class FlogoFlowsDetailTasksInstallComponent {

  public activities : any[] = [];
  private isActivated = false;
  onInstalled = new EventEmitter();

  constructor(public translate: TranslateService) {
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
