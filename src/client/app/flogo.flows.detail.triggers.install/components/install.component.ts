import { Component, EventEmitter } from '@angular/core';
import { FlogoInstallerComponent } from '../../flogo.installer/components/installer.component';
import { TranslatePipe } from 'ng2-translate/ng2-translate';

@Component( {
  selector : 'flogo-flows-detail-triggers-install',
  directives : [ FlogoInstallerComponent ],
  outputs : [ 'onInstalled: flogoOnInstalled' ],
  moduleId : module.id,
  templateUrl : 'install.tpl.html',
  pipes: [TranslatePipe]
} )
export class FlogoFlowsDetailTriggersInstallComponent {

  public triggers : any[] = [];
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
