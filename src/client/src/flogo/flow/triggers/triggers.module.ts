import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule as FlogoSharedModule } from '@flogo/shared';
import { CoreModule as FlogoCoreModule } from '@flogo/core';
import {CoreModule as FlowCoreModule} from '@flogo/flow/core';
import {InstallerModule as ContribInstallerModule} from '@flogo/flow/shared/installer';
import {FlogoFlowTriggersPanelComponent} from './triggers.component';
import {FlogoSelectTriggerComponent} from './select-trigger/select-trigger.component';
import {TriggerBlockComponent} from './trigger-block';
import {ConfiguratorModule as TriggersConfiguratorModule} from '@flogo/flow/triggers/configurator';


@NgModule({
  imports: [
    CommonModule,
    FlogoSharedModule,
    FlogoCoreModule,
    FlowCoreModule,
    TriggersConfiguratorModule,
    ContribInstallerModule
  ],
  declarations: [
    TriggerBlockComponent,
    FlogoFlowTriggersPanelComponent,
    FlogoSelectTriggerComponent
  ],
  exports: [
    FlogoFlowTriggersPanelComponent
  ]
})
export class TriggersModule { }
