import { NgModule } from '@angular/core';
import { CommonModule as NgCommonModule } from '@angular/common';
import { SharedModule as FlogoSharedModule } from '@flogo/shared';
import { MapperModule } from '@flogo/flow/shared/mapper';

import { TriggerMapperComponent } from './trigger-mapper.component';
import { TriggerMapperService } from './trigger-mapper.service';

@NgModule({
  imports: [// module dependencies
    NgCommonModule,
    FlogoSharedModule,
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
