import { FormBuilderModule as FlogoFormBuilderModule } from '../flogo.form-builder/flogo.form-builder.module';
import { InstallerModule as FlogoInstallerModule } from './shared/installer';
import { TransformModule as FlogoTransformModule } from '../flogo.transform';
import { InstructionsModule as FlogoInstructionsModule } from '../flogo.instructions/flogo.instructions.module';
import { LogsModule as FlogoLogsModule } from '../flogo.logs/flogo.logs.module';
import { FooterModule as FlogoFooterModule } from '../flogo.footer/flogo.footer.module';
import { FormModule as FlogoFormModule } from '../flogo.form/flogo.form.module';

import { EmptyDetailComponent } from './empty-detail/empty-detail.component';
import { FlogoFlowsDetailTriggersComponent } from '../flogo.flows.detail.triggers/components/triggers.component';
import { FlogoFlowsDetailTriggersDetailComponent } from '../flogo.flows.detail.triggers.detail/components/detail.component';
import { FlogoFlowsDetailTasksComponent } from '../flogo.flows.detail.tasks/components/tasks.component';
import { FlogoFlowsDetailTasksDetailComponent } from '../flogo.flows.detail.tasks.detail/components/detail.component';
import { FlogoSelectTriggerComponent } from '../flogo.select-trigger/components/select-trigger.component';

import { FlogoFlowsDetailDiagramComponent } from '../flogo.flows.detail.diagram/components/diagram.component';
import { FlogoFlowsDetailErrorPanelComponent } from '../flogo.flows.detail.error-panel/components/error-panel.component';


import { FlogoFlowsDetailTasksInstallComponent } from '../flogo.flows.detail.tasks.install/components/install.component';
import { FlogoFlowsDetailTriggersInstallComponent } from '../flogo.flows.detail.triggers.install/components/install.component';

import { FlogoFlowTriggersPanelComponent } from '../flogo.flows.detail.triggers-panel/components/triggers-panel.component';
import { ParamsSchemaModule } from './params-schema';

import { TriggerMapperModule as FlogoTriggerMapperModule } from '../flogo.trigger-mapper';

/////////

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule as FlogoSharedModule } from '@flogo/shared';
import { FormBuilderModule as FlogoCommonFormBuilderModule } from './shared/dynamic-form';
import { FlogoRunFlowComponent } from './run-flow/run-flow.component';

import { CoreModule as FlowCoreModule } from './core';

import { routing } from './flow.routing';
import { FlowComponent } from './flow.component';


@NgModule({
  imports: [
    CommonModule,
    FlogoSharedModule,

    FlowCoreModule,
    ParamsSchemaModule,

    FlogoFormBuilderModule,
    FlogoInstallerModule,
    FlogoTransformModule,
    FlogoInstructionsModule,
    FlogoFooterModule,
    FlogoFormModule,
    FlogoLogsModule,
    FlogoTriggerMapperModule,
    FlogoCommonFormBuilderModule,
    routing
  ],
  declarations: [
    EmptyDetailComponent,
    FlogoFlowsDetailTriggersComponent,
    FlogoFlowsDetailTriggersDetailComponent,
    FlogoFlowsDetailTasksComponent,
    FlogoFlowsDetailTasksDetailComponent,
    FlogoSelectTriggerComponent,

    FlogoFlowsDetailDiagramComponent,
    FlogoFlowsDetailErrorPanelComponent,

    FlogoFlowsDetailTasksInstallComponent,
    FlogoFlowsDetailTriggersInstallComponent,
    FlogoFlowTriggersPanelComponent,

    FlogoRunFlowComponent,

    ////
    FlowComponent,

  ],
  providers: [],
  bootstrap: [
    FlowComponent
  ]
})
export class FlowModule {
}
