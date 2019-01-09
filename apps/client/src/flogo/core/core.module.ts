import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WalkthroughModule } from './walkthrough/walkthrough.module';
import { FlogoNavbarComponent } from './navbar/navbar.component';

@NgModule({
  declarations: [
    FlogoNavbarComponent
  ],
  imports: [
    CommonModule,
    WalkthroughModule
  ],
  exports: [
    FlogoNavbarComponent
  ],
})
export class CoreModule { }
