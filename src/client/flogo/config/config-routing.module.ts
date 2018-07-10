import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { FlogoConfigComponent } from './config.component';

@NgModule({
  imports: [
    RouterModule.forChild([{
      path: '_config',
      component: FlogoConfigComponent
    }]),
  ],
  exports: [ RouterModule ],
})
export class ConfigRoutingModule {}
