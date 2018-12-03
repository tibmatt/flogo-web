import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BsModalModule } from 'ng2-bs3-modal';
import { SharedModule as FlogoSharedModule } from '../shared/shared.module';
import { FlogoHomeComponent } from './home.component';
import { FlogoAppsListComponent } from './apps-list/apps-list.component';
import { FlogoAppImportComponent } from './app-import/app-import.component';
import { ImportErrorFormatterService } from './core/import-error-formatter.service';
import { FlogoNewAppComponent } from './new-app/new-app.component';
import { HomeRoutingModule } from './home-routing.module';

@NgModule({
  imports: [CommonModule, FormsModule, BsModalModule, FlogoSharedModule, HomeRoutingModule],
  declarations: [FlogoHomeComponent, FlogoAppsListComponent, FlogoAppImportComponent, FlogoNewAppComponent],
  bootstrap: [FlogoHomeComponent],
  providers: [ImportErrorFormatterService],
})
export class FlogoHomeModule {}
