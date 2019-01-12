import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CoreModule as FlogoCoreModule } from '@flogo-web/client-core';
import { SharedModule as FlogoSharedModule } from '@flogo-web/client-shared';

import { CoreModule as FlowCoreModule } from '../core';
import { InstallerModule as ContribInstallerModule } from '../shared/installer';
import { FlogoFlowTriggersPanelComponent } from './triggers.component';
import { FlogoSelectTriggerComponent } from './select-trigger/select-trigger.component';
import { TriggerBlockComponent } from './trigger-block';
import { ConfiguratorModule as TriggersConfiguratorModule } from './configurator';

@NgModule({
  imports: [
    CommonModule,
    FlogoSharedModule,
    FlogoCoreModule,
    FlowCoreModule,
    TriggersConfiguratorModule,
    ContribInstallerModule,
  ],
  declarations: [
    TriggerBlockComponent,
    FlogoFlowTriggersPanelComponent,
    FlogoSelectTriggerComponent,
  ],
  exports: [FlogoFlowTriggersPanelComponent],
})
export class TriggersModule {}
