import { NgModule } from '@angular/core';
import { CommonModule as NgCommonModule } from '@angular/common';

import { CommonModule as FlogoCommonModule } from '../../common/common.module';

import { TransformComponent } from './transform.component';
import { MapperModule } from '../flogo.mapper';

@NgModule({
  imports: [// module dependencies
    NgCommonModule,
    FlogoCommonModule,
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
