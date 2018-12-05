import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule as FlogoSharedModule } from '@flogo-web/client/shared';
import { CoreModule as FlogoCoreModule } from '@flogo-web/client/core';
import { CoreModule as FlowCoreModule } from '@flogo-web/client/flow/core';
import { InstallerModule as ContribInstallerModule } from '@flogo-web/client/flow/shared/installer';
import { FlogoFlowTriggersPanelComponent } from './triggers.component';
import { FlogoSelectTriggerComponent } from './select-trigger/select-trigger.component';
import { TriggerBlockComponent } from './trigger-block';
import { ConfiguratorModule as TriggersConfiguratorModule } from '@flogo-web/client/flow/triggers/configurator';

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
