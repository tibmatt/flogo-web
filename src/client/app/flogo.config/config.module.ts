import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FlogoConfigComponent } from './components/config.component';
import { ServiceStatusIndicatorComponent } from './components/service-status-indicator.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule
  ],
  declarations: [
    FlogoConfigComponent,
    ServiceStatusIndicatorComponent
  ],
})
export class ConfigModule {}
