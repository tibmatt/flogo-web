import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FlogoFlowsDetailTriggersDetailComponent} from './trigger-detail.component';
import {FormBuilderModule as FlogoFormBuilderModule} from '@flogo/flow/shared/form-builder';

@NgModule({
  imports: [
    CommonModule,
    FlogoFormBuilderModule
  ],
  declarations: [
    FlogoFlowsDetailTriggersDetailComponent
  ],
  exports: [
    FlogoFlowsDetailTriggersDetailComponent
  ]
})
export class TriggerDetailModule { }
