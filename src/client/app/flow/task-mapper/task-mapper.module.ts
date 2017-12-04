import { NgModule } from '@angular/core';
import { CommonModule as NgCommonModule } from '@angular/common';

import { SharedModule as FlogoSharedModule } from '@flogo/shared';

import { TaskMapperComponent } from './task-mapper.component';
import { MapperModule } from '../shared/mapper';

@NgModule({
  imports: [// module dependencies
    NgCommonModule,
    FlogoSharedModule,
    MapperModule,
  ],
  declarations: [
    TaskMapperComponent,
  ],
  exports: [
    TaskMapperComponent,
  ],
  providers: []
})
export class TaskMapperModule {
}
