import { NgModule } from '@angular/core';
import { CommonModule as NgCommonModule } from '@angular/common';
import { CommonModule as FlogoCommonModule } from '../../common/common.module';
import { MapperModule } from '../flogo.mapper';

import { TriggerMapperComponent } from './trigger-mapper.component';
import { TriggerMapperService } from './trigger-mapper.service';

@NgModule({
  imports: [// module dependencies
    NgCommonModule,
    FlogoCommonModule,
    MapperModule,
  ],
  declarations: [
    TriggerMapperComponent,
  ],
  exports: [
    TriggerMapperComponent,
  ],
  providers: [
    TriggerMapperService
  ]
})
export class TriggerMapperModule {
}
