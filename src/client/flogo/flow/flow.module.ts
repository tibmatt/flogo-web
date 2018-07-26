import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreModule } from '@ngrx/store';

import { SharedModule as FlogoSharedModule } from '@flogo/shared';
import { LogsModule as FlogoLogsModule } from '@flogo/logs';
import { DiagramModule } from '@flogo/packages/diagram';

import { FormBuilderModule as FlogoCommonFormBuilderModule } from './shared/dynamic-form';
import { FlogoRunFlowComponent } from './run-flow/run-flow.component';

import { CoreModule as FlowCoreModule } from './core';

import {TriggersModule as FlogoFlowTriggersModule} from '@flogo/flow/triggers';
import {TaskDetailModule as FlogoFlowTaskDetailModule} from './task-detail';
import {TaskAddModule as FlogoFlowTaskAddModule} from './task-add';
import { TaskMapperModule as FlogoTaskMapperModule } from './task-configurator';
import { ParamsSchemaModule } from './params-schema';

import { FlowRoutingModule } from './flow-routing.module';
import { FlowComponent } from './flow.component';
import { EmptyDetailComponent } from './empty-detail/empty-detail.component';
import { FlowDataResolver } from './flow-data.resolver';
import { featureReducer } from './core/state';
import {FlogoFlowDiagramComponent} from '@flogo/flow/flow-diagram/flow-diagram.component';
import {FlowTabsComponent} from '@flogo/flow/flow-tabs/flow-tabs.component';

@NgModule({
  imports: [
    StoreModule.forFeature('flow', featureReducer),
    CommonModule,
    FlogoSharedModule,
    FlogoLogsModule,
    DiagramModule,

    FlowCoreModule,
    ParamsSchemaModule,
    FlogoTaskMapperModule,
    FlogoCommonFormBuilderModule,
    FlogoFlowTriggersModule,
    FlogoFlowTaskDetailModule,
    FlogoFlowTaskAddModule,
    FlowRoutingModule,
  ],
  declarations: [
    EmptyDetailComponent,
    FlogoRunFlowComponent,
    FlowComponent,
    FlogoFlowDiagramComponent,
    FlowTabsComponent
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
