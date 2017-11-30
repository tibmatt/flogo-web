import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FlogoConfigComponent } from './config.component';
import { ServiceStatusIndicatorComponent } from './service-status-indicator.component';
import { routing } from './config.routing';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    routing
  ],
  declarations: [
    FlogoConfigComponent,
    ServiceStatusIndicatorComponent
  ],
})
export class ConfigModule {
}
