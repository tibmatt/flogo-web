import { NgModule } from '@angular/core';
import { CommonModule as NgCommonModule } from '@angular/common';

import { SharedModule as FlogoSharedModule } from '@flogo/shared';

import { TaskConfiguratorComponent } from './task-configurator.component';
import { MapperModule } from '../shared/mapper';

@NgModule({
  imports: [// module dependencies
    NgCommonModule,
    FlogoSharedModule,
    MapperModule,
  ],
  declarations: [
    TaskConfiguratorComponent,
  ],
  exports: [
    TaskConfiguratorComponent,
  ],
  providers: []
})
export class TaskMapperModule {
}
