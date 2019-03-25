import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { FlogoNavbarComponent } from './navbar/navbar.component';
import { OverlayModule } from '@angular/cdk/overlay';
import { PortalModule } from '@angular/cdk/portal';

@NgModule({
  declarations: [FlogoNavbarComponent],
  imports: [CommonModule, RouterModule, OverlayModule, PortalModule, TranslateModule],
  exports: [FlogoNavbarComponent],
})
export class CoreModule {}
