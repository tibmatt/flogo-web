import {NgModule} from '@angular/core';
import { ReactiveFormsModule} from '@angular/forms';
import {CommonModule as NgCommonModule} from '@angular/common';

import {SharedModule as FlogoSharedModule} from '@flogo/shared';
import {MapperModule} from '@flogo/flow/shared/mapper';

import {ConfiguratorService} from './configurator.service';
import {ConfiguratorComponent} from './configurator.component';
import { ConfigureTriggerComponent } from './trigger/trigger.component';
import {
  TriggerDetailComponent,
  TabsComponent,
  ConfigureSettingsComponent,
  ConfigureDetailsService,
  SettingsFormBuilder
} from './trigger-detail';

@NgModule({
  imports: [
    NgCommonModule,
    FlogoSharedModule,
    MapperModule,
    ReactiveFormsModule
  ],
  declarations: [
    TriggerDetailComponent,
    ConfiguratorComponent,
    ConfigureTriggerComponent,
    ConfigureSettingsComponent,
    TabsComponent,
  ],
  exports: [
    ConfiguratorComponent
  ],
  providers: [
    ConfiguratorService,
    ConfigureDetailsService,
    SettingsFormBuilder
  ]
})

export class ConfiguratorModule {
}
