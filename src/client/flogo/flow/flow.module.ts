import { TaskMapperModule as FlogoTaskMapperModule } from './task-configurator';

import { EmptyDetailComponent } from './empty-detail/empty-detail.component';

import { ParamsSchemaModule } from './params-schema';
/////////

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule as FlogoSharedModule } from '@flogo/shared';
import { LogsModule as FlogoLogsModule } from '@flogo/logs';

import { FormBuilderModule as FlogoCommonFormBuilderModule } from './shared/dynamic-form';
import { FlogoRunFlowComponent } from './run-flow/run-flow.component';

import { CoreModule as FlowCoreModule } from './core';

import {DiagramModule as FlogoDiagramModule} from '@flogo/flow/shared/diagram';
import {ErrorPanelModule as FlogoFlowErrorPanelModule} from '@flogo/flow/error-panel';
import {TriggersModule as FlogoFlowTriggersModule} from '@flogo/flow/triggers';
import {TaskDetailModule as FlogoFlowTaskDetailModule} from './task-detail';
import {TaskAddModule as FlogoFlowTaskAddModule} from './task-add';
import {TriggerDetailModule as FlogoFlowTriggerDetailModule} from '@flogo/flow/trigger-detail';

import { routing } from './flow.routing';
import { FlowComponent } from './flow.component';
import { FlowDataResolver } from './flow-data.resolver';


@NgModule({
  imports: [
    CommonModule,
    FlogoSharedModule,
    FlogoLogsModule,

    FlowCoreModule,
    ParamsSchemaModule,
    FlogoTaskMapperModule,
    FlogoCommonFormBuilderModule,
    FlogoDiagramModule,
    FlogoFlowErrorPanelModule,
    FlogoFlowTriggersModule,
    FlogoFlowTaskDetailModule,
    FlogoFlowTriggerDetailModule,
    FlogoFlowTaskAddModule,
    routing
  ],
  declarations: [
    EmptyDetailComponent,
    FlogoRunFlowComponent,
    FlowComponent,
  ],
  providers: [
    FlowDataResolver,
  ],
  bootstrap: [
    FlowComponent
  ]
})
export class FlowModule {
}
