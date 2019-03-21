import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { FlogoNavbarComponent } from './navbar/navbar.component';

@NgModule({
  declarations: [FlogoNavbarComponent],
  imports: [CommonModule, RouterModule, TranslateModule],
  exports: [FlogoNavbarComponent],
})
export class CoreModule {}
