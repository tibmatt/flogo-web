import { NgModule } from '@angular/core';
import { CommonModule as NgCommonModule } from '@angular/common';

import { SharedModule as FlogoSharedModule } from '@flogo/shared';

import { TransformComponent } from './transform.component';
import { MapperModule } from '../flow/shared/mapper';

@NgModule({
  imports: [// module dependencies
    NgCommonModule,
    FlogoSharedModule,
    MapperModule,
  ],
  declarations: [
    TransformComponent,
  ],
  exports: [
    TransformComponent,
  ],
  providers: []
})
export class TransformModule {
}
