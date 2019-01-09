import { NgModule } from '@angular/core';
import { CommonModule as NgCommonModule } from '@angular/common';
import { SharedModule } from '@flogo-web/client-shared';

import { WalkthroughComponent } from './walkthrough.component';

@NgModule({
  imports: [
    // module dependencies
    NgCommonModule,
    SharedModule
  ],
  declarations: [WalkthroughComponent],
  exports: [WalkthroughComponent],
  providers: [],
})
export class WalkthroughModule {}
