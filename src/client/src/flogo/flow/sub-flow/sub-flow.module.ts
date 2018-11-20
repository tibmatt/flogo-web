import {CommonModule} from '@angular/common';
import {CoreModule as FlowCoreModule} from '@flogo/core';
import {NgModule} from '@angular/core';
import {SubFlowComponent} from './sub-flow.component';
import {BsModalModule} from 'ng2-bs3-modal';
import {FlowsListModule} from '../shared/flows-list';

@NgModule({
  imports: [
    CommonModule,
    BsModalModule,
    FlowCoreModule,
    FlowsListModule
  ],
  declarations: [
    SubFlowComponent
  ],
  exports: [
    SubFlowComponent
  ]
})
export class SubFlowModule { }
