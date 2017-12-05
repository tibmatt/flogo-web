import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FlogoFlowsDetailTasksComponent} from '@flogo/flow/task-add/task-add.component';
import {CoreModule as FlogoCoreModule} from '@flogo/core';
import {SharedModule as FlogoSharedModule} from '@flogo/shared';
import {InstallModule as ActivityInsatallModule} from './install';

@NgModule({
  imports: [
    CommonModule,
    FlogoCoreModule,
    FlogoSharedModule,
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
