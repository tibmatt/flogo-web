import {NgModule} from '@angular/core';
import {CommonModule as NgCommonModule} from '@angular/common';

import {CommonModule as FlogoCommonModule} from '../../common/common.module';

import {FlogoFooterComponent} from './components/footer.component';

@NgModule({
  imports: [// module dependencies
    NgCommonModule,
    FlogoCommonModule
  ],
  declarations: [
    FlogoFooterComponent
  ],
  exports: [
    FlogoFooterComponent
  ],
  providers: [
  ]
})
export class FooterModule {
}
