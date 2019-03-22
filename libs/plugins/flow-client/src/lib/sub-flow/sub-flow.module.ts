import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BsModalModule } from 'ng2-bs3-modal';

import { CoreModule as FlowCoreModule } from '@flogo-web/client/core';

import { FlowsListModule } from '../shared/flows-list';
import { SubFlowComponent } from './sub-flow.component';

@NgModule({
  imports: [CommonModule, BsModalModule, FlowCoreModule, FlowsListModule],
  declarations: [SubFlowComponent],
  exports: [SubFlowComponent],
})
export class SubFlowModule {}
