import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule as FlogoSharedModule } from '@flogo/shared';
import { CoreModule as FlogoCoreModule } from '@flogo/core';
import {CoreModule as FlowCoreModule} from '@flogo/flow/core';
import {TriggerMapperModule as FlowTriggerMapperModule} from '@flogo/flow/triggers/trigger-mapper';
import {InstallerModule as ContribInstallerModule} from '@flogo/flow/shared/installer';
import {FlogoFlowTriggersPanelComponent} from './triggers.component';
import {FlogoTriggerClickHandlerService} from './shared/click-handler.service';
import {FlogoSelectTriggerComponent} from './select-trigger/select-trigger.component';

@NgModule({
  imports: [
    CommonModule,
    FlogoSharedModule,
    FlogoCoreModule,
    FlowCoreModule,
    FlowTriggerMapperModule,
    ContribInstallerModule
  ],
  declarations: [
    FlogoFlowTriggersPanelComponent,
    FlogoSelectTriggerComponent
  ],
  providers: [
    FlogoTriggerClickHandlerService
  ],
  exports: [
    FlogoFlowTriggersPanelComponent
  ]
})
export class TriggersModule { }
