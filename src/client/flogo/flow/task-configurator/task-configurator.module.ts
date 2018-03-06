import { NgModule } from '@angular/core';
import { CommonModule as NgCommonModule } from '@angular/common';

import { SharedModule as FlogoSharedModule } from '@flogo/shared';
import { MapperModule } from '../shared/mapper';

import { TaskConfiguratorComponent } from './task-configurator.component';
import { InputMapperComponent } from './input-mapper';
import { IteratorComponent } from './iterator/iterator.component';
import { SubFlowComponent } from './subflow/subflow.component';
import {FlowsListModule} from '../shared/flows-list';

@NgModule({
  imports: [// module dependencies
    NgCommonModule,
    FlogoSharedModule,
    MapperModule,
    FlowsListModule
  ],
  declarations: [
    InputMapperComponent,
    IteratorComponent,
    SubFlowComponent,
    TaskConfiguratorComponent,
  ],
  exports: [
    TaskConfiguratorComponent,
  ],
  providers: []
})
export class TaskMapperModule {
}
