import {NgModule} from '@angular/core';
import {CommonModule as NgCommonModule} from '@angular/common';
import {SharedModule as FlogoSharedModule} from '@flogo/shared';
import {MapperModule} from '@flogo/flow/shared/mapper';
import {TriggerMapperComponent} from './trigger-mapper';
import {ConfiguratorComponent} from './configurator.component';
import {ConfiguratorService} from './configurator.service';
import {ConfigureTriggerComponent} from './trigger/trigger.component';
import { TabsComponent } from './tabs/tabs.component';

@NgModule({
  imports: [
    NgCommonModule,
    FlogoSharedModule,
    MapperModule
  ],
  declarations: [
    TriggerMapperComponent,
    ConfiguratorComponent,
    ConfigureTriggerComponent,
    TabsComponent
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
