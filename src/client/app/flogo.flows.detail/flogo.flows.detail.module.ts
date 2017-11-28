import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { SharedModule as FlogoSharedModule } from '../shared/shared.module';
import { FormBuilderModule as FlogoFormBuilderModule } from '../flogo.form-builder/flogo.form-builder.module';
import { InstallerModule as FlogoInstallerModule } from '../flogo.installer/flogo.installer.module';
import { TransformModule as FlogoTransformModule } from '../flogo.transform';
import { InstructionsModule as FlogoInstructionsModule } from '../flogo.instructions/flogo.instructions.module';
import { LogsModule as FlogoLogsModule } from '../flogo.logs/flogo.logs.module';
import { FooterModule as FlogoFooterModule } from '../flogo.footer/flogo.footer.module';
import { FormModule as FlogoFormModule } from '../flogo.form/flogo.form.module';

import { FlogoCanvasComponent } from './components/canvas.component';

import { FlogoFlowsDetailComponent } from './components/flow-detail.component';
import { FlogoFlowsDetailTriggersComponent } from '../flogo.flows.detail.triggers/components/triggers.component';
import { FlogoFlowsDetailTriggersDetailComponent } from '../flogo.flows.detail.triggers.detail/components/detail.component';
import { FlogoFlowsDetailTasksComponent } from '../flogo.flows.detail.tasks/components/tasks.component';
import { FlogoFlowsDetailTasksDetailComponent } from '../flogo.flows.detail.tasks.detail/components/detail.component';
import { FlogoSelectTriggerComponent } from '../flogo.select-trigger/components/select-trigger.component';

import { FlogoFlowsDetailDiagramComponent } from '../flogo.flows.detail.diagram/components/diagram.component';
import { FlogoFlowsDetailErrorPanelComponent } from '../flogo.flows.detail.error-panel/components/error-panel.component';


import { FlogoFlowsDetailTasksInstallComponent } from '../flogo.flows.detail.tasks.install/components/install.component';
import { FlogoFlowsDetailTriggersInstallComponent } from '../flogo.flows.detail.triggers.install/components/install.component';

import { RunnerService } from './services/runner.service';
import { routing } from './flogo.flows.detail.routing';
import { UIModelConverterService } from './services/ui-model-converter.service';
import { FlogoFlowService } from './services/flow.service';

import { FlogoFlowTriggersPanelComponent } from '../flogo.flows.detail.triggers-panel/components/triggers-panel.component';
import { FlogoFlowInputSchemaComponent } from './components/flow-input-schema.component';
import { FlogoTriggerClickHandlerService } from '../flogo.flows.detail.triggers-panel/services/click-handler.service';

import { TriggerMapperModule as FlogoTriggerMapperModule } from '../flogo.trigger-mapper';
import { FlowSchemaComponent as FlogoFlowSchemaComponent } from './components/flow-schema.component';
import { FlogoFlowInputFieldComponent } from '../flogo.flows.input/component/input.component';

import { FormBuilderModule as FlogoCommonFormBuilderModule } from '../flow-designer/shared/dynamic-form/form-builder.module';
import { FlogoRunFlowComponent } from './run-flow/run-flow.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    FlogoSharedModule,
    FlogoFormBuilderModule,
    FlogoInstallerModule,
    FlogoTransformModule,
    FlogoInstructionsModule,
    FlogoFooterModule,
    FlogoFormModule,
    FlogoLogsModule,
    FlogoTriggerMapperModule,
    ReactiveFormsModule,
    FlogoCommonFormBuilderModule,
    routing
  ],
  declarations: [
    FlogoFlowsDetailComponent,
    FlogoFlowsDetailTriggersComponent,
    FlogoFlowsDetailTriggersDetailComponent,
    FlogoFlowsDetailTasksComponent,
    FlogoFlowsDetailTasksDetailComponent,
    FlogoSelectTriggerComponent,

    FlogoFlowsDetailDiagramComponent,
    FlogoFlowsDetailErrorPanelComponent,

    FlogoFlowsDetailTasksInstallComponent,
    FlogoFlowsDetailTriggersInstallComponent,

    FlogoCanvasComponent,
    FlogoFlowTriggersPanelComponent,
    FlogoFlowInputSchemaComponent,

    FlogoFlowSchemaComponent,
    FlogoFlowInputFieldComponent,
    FlogoRunFlowComponent

  ],
  providers: [
    RunnerService,
    UIModelConverterService,
    FlogoFlowService,
    FlogoTriggerClickHandlerService
  ],
  bootstrap: [
    FlogoCanvasComponent
  ]
})
export class FlogoFlowsDetailModule {
}
