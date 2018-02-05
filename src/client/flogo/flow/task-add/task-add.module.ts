import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FlogoFlowsDetailTasksComponent} from '@flogo/flow/task-add/task-add.component';
import {CoreModule as FlogoCoreModule} from '@flogo/core';
import {SharedModule as FlogoSharedModule} from '@flogo/shared';
import {InstallModule as ActivityInsatallModule} from './install';
import {CoreModule as FlowCoreModule} from '@flogo/flow/core';
import {SubFlowModule} from '@flogo/flow/sub-flow/sub-flow.module';

@NgModule({
  imports: [
    CommonModule,
    FlogoCoreModule,
    FlogoSharedModule,
    FlowCoreModule,
    SubFlowModule,
    ActivityInsatallModule
  ],
  declarations: [
    FlogoFlowsDetailTasksComponent
  ],
  exports: [
    FlogoFlowsDetailTasksComponent
  ]
})
export class TaskAddModule { }
