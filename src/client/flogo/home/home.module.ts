import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Ng2Bs3ModalModule } from 'ng2-bs3-modal/ng2-bs3-modal';
import { SharedModule as FlogoSharedModule } from '../shared/shared.module';
import { FlogoHomeComponent } from './home.component';
import { FlogoAppsListComponent } from './apps-list/apps-list.component';
import { FlogoAppImportComponent } from './app-import/app-import.component';
import { ImportErrorFormatterService } from './core/import-error-formatter.service';
import { FlogoNewAppComponent } from './new-app/new-app.component';
import { RouterModule } from '@angular/router';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    Ng2Bs3ModalModule,
    FlogoSharedModule,
    RouterModule
  ],
  declarations: [
    FlogoHomeComponent,
    FlogoAppsListComponent,
    FlogoAppImportComponent,
    FlogoNewAppComponent
  ],
  bootstrap: [FlogoHomeComponent],
  providers: [
    ImportErrorFormatterService
  ]
})
export class FlogoHomeModule {
}
