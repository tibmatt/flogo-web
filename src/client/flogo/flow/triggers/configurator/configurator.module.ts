import {NgModule} from '@angular/core';
import {CommonModule as NgCommonModule} from '@angular/common';
import {SharedModule as FlogoSharedModule} from '@flogo/shared';
import {MapperModule} from '@flogo/flow/shared/mapper';
import {TriggerMapperComponent} from './trigger-mapper';
import {ConfiguratorComponent} from './configurator.component';
import {ConfiguratorService} from './configurator.service';

@NgModule({
  imports: [
    NgCommonModule,
    FlogoSharedModule,
    MapperModule
  ],
  declarations: [
    TriggerMapperComponent,
    ConfiguratorComponent
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
