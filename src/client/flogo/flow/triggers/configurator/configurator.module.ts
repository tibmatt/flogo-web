import {NgModule} from '@angular/core';
import {CommonModule as NgCommonModule} from '@angular/common';
import {SharedModule as FlogoSharedModule} from '@flogo/shared';
import {MapperModule} from '@flogo/flow/shared/mapper';
import {TriggerMapperComponent} from './trigger-mapper';
import {ConfiguratorComponent} from './configurator.component';
import {ConfiguratorService} from './configurator.service';
import {ConfigureTriggerComponent} from './trigger/trigger.component';
import {ReactiveFormsModule} from '@angular/forms';
import {
  ConfigureDetailsComponent as TriggerConfigureDetailsComponent,
  TabsComponent as TriggerConfigureDetailsTabsComponent,
  ConfigureSettingsComponent as TriggerConfigureSettingsComponent
} from './details';

@NgModule({
  imports: [
    NgCommonModule,
    FlogoSharedModule,
    MapperModule,
    ReactiveFormsModule
  ],
  declarations: [
    TriggerMapperComponent,
    ConfiguratorComponent,
    ConfigureTriggerComponent,
    TriggerConfigureDetailsComponent,
    TriggerConfigureDetailsTabsComponent,
    TriggerConfigureSettingsComponent
  ],
  exports: [
    ConfiguratorComponent
  ],
  providers: [
    ConfiguratorService
  ]
})

export class ConfiguratorModule {
}
