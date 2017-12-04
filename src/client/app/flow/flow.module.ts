import { FormBuilderModule as FlogoFormBuilderModule } from './shared/form-builder';
import { InstallerModule as FlogoInstallerModule } from './shared/installer';
import { TransformModule as FlogoTransformModule } from '../flogo.transform';

import { EmptyDetailComponent } from './empty-detail/empty-detail.component';
import { FlogoFlowsDetailTriggersComponent } from '../flogo.flows.detail.triggers/components/triggers.component';
import { FlogoFlowsDetailTriggersDetailComponent } from '../flogo.flows.detail.triggers.detail/components/detail.component';
import { FlogoFlowsDetailTasksComponent } from '../flogo.flows.detail.tasks/components/tasks.component';
import { FlogoFlowsDetailTasksDetailComponent } from '../flogo.flows.detail.tasks.detail/components/detail.component';
import { FlogoSelectTriggerComponent } from '../flogo.select-trigger/components/select-trigger.component';

import { FlogoFlowsDetailTasksInstallComponent } from '../flogo.flows.detail.tasks.install/components/install.component';
import { FlogoFlowsDetailTriggersInstallComponent } from '../flogo.flows.detail.triggers.install/components/install.component';

import { FlogoFlowTriggersPanelComponent } from '../flogo.flows.detail.triggers-panel/components/triggers-panel.component';
import { ParamsSchemaModule } from './params-schema';

import { TriggerMapperModule as FlogoTriggerMapperModule } from '../flogo.trigger-mapper';

/////////

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule as FlogoSharedModule } from '@flogo/shared';
import { LogsModule as FlogoLogsModule } from '@flogo/logs';

import { FormBuilderModule as FlogoCommonFormBuilderModule } from './shared/dynamic-form';
import { FlogoRunFlowComponent } from './run-flow/run-flow.component';

import { CoreModule as FlowCoreModule } from './core';

import { routing } from './flow.routing';
import { FlowComponent } from './flow.component';
import {DiagramModule as FlogoDiagramModule} from '@flogo/flow/shared/diagram';
import {ErrorPanelModule as FlogoFlowErrorPanelModule} from '@flogo/flow/error-panel';


@NgModule({
  imports: [
    CommonModule,
    FlogoSharedModule,
    FlogoLogsModule,

    FlowCoreModule,
    ParamsSchemaModule,

    FlogoFormBuilderModule,
    FlogoInstallerModule,
    FlogoTransformModule,
    FlogoTriggerMapperModule,
    FlogoCommonFormBuilderModule,
    FlogoDiagramModule,
    FlogoFlowErrorPanelModule,
    routing
  ],
  declarations: [
    EmptyDetailComponent,
    FlogoFlowsDetailTriggersComponent,
    FlogoFlowsDetailTriggersDetailComponent,
    FlogoFlowsDetailTasksComponent,
    FlogoFlowsDetailTasksDetailComponent,
    FlogoSelectTriggerComponent,

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
