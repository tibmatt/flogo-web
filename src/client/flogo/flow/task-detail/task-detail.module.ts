import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CoreModule as FlogoCoreModule } from '@flogo/core';
import {FlogoFlowsDetailTasksDetailComponent} from './task-detail.component';
import {FormBuilderModule} from '@flogo/flow/shared/form-builder';

@NgModule({
  imports: [
    CommonModule,
    FlogoCoreModule,
    FormBuilderModule
  ],
  declarations: [
    FlogoFlowsDetailTasksDetailComponent
  ],
  exports: [
    FlogoFlowsDetailTasksDetailComponent
  ]
})
export class TaskDetailModule { }
