import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { WalkthroughModule } from './walkthrough/walkthrough.module';
import { FlogoNavbarComponent } from './navbar/navbar.component';

@NgModule({
  declarations: [
    FlogoNavbarComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    WalkthroughModule,
    TranslateModule
  ],
  exports: [
    FlogoNavbarComponent
  ],
})
export class CoreModule { }
