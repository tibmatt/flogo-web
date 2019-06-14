import { NgModule } from '@angular/core';
import { CommonModule as NgCommonModule } from '@angular/common';

import { SharedModule as FlogoSharedModule } from '@flogo-web/lib-client/common';

import { HeaderComponent } from './header.component';

@NgModule({
  declarations: [HeaderComponent],
  imports: [NgCommonModule, FlogoSharedModule],
  exports: [HeaderComponent],
})
export class HeaderModule {}
