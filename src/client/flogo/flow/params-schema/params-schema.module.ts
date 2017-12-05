import { NgModule } from '@angular/core';
import { SharedModule } from '@flogo/shared';

import { ParamsSchemaComponent } from './params-schema.component';
import { ButtonComponent } from './button/button.component';
import { ParamRowComponent } from '@flogo/flow/params-schema/param-row/param-row.component';

@NgModule({
  imports: [
    SharedModule
  ],
  declarations: [
    ParamsSchemaComponent,
    ButtonComponent,

    // private to this module
    ParamRowComponent,
  ],
  exports: [
    ParamsSchemaComponent,
    ButtonComponent,
  ]
})
export class ParamsSchemaModule { }
