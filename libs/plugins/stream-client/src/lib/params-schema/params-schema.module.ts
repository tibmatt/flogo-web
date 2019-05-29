import { NgModule } from '@angular/core';
import { SharedModule } from '@flogo-web/lib-client/common';

import { ParamsSchemaComponent } from './params-schema.component';
import { ButtonComponent } from './button/button.component';
import { ParamRowComponent } from './param-row/param-row.component';
import { ParamRowOutputComponent } from './param-row-output/param-row-output.component';
import { GroupByParamService } from './param-row/group-by-param.service';

@NgModule({
  imports: [SharedModule],
  declarations: [
    ParamsSchemaComponent,
    ButtonComponent,

    // private to this module
    ParamRowComponent,
    ParamRowOutputComponent,
  ],
  providers: [GroupByParamService],
  exports: [ParamsSchemaComponent, ButtonComponent],
})
export class ParamsSchemaModule {}
