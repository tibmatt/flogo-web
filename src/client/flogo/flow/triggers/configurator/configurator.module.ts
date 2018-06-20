import {NgModule} from '@angular/core';
import { ReactiveFormsModule} from '@angular/forms';
import { CommonModule as NgCommonModule } from '@angular/common';
import { OverlayModule } from '@angular/cdk/overlay';
import { PortalModule } from '@angular/cdk/portal';

import {SharedModule as FlogoSharedModule} from '@flogo/shared';
import {MapperModule} from '@flogo/flow/shared/mapper';

import {ConfiguratorService} from './configurator.service';
import {ConfiguratorComponent} from './configurator.component';
import { ConfigureTriggerComponent } from './trigger/trigger.component';
import { ConfirmationComponent } from './confirmation';
import {
  TriggerDetailComponent,
  TabsComponent,
  ConfigureSettingsComponent,
  ConfigureDetailsService,
  SettingsFormBuilder,
  AutoCompleteDirective,
  AutoCompleteContentComponent,
  ActionButtonsComponent,
} from './trigger-detail';

@NgModule({
  imports: [
    NgCommonModule,
    ReactiveFormsModule,
    OverlayModule,
    PortalModule,
    FlogoSharedModule,
    MapperModule
  ],
  declarations: [
    TriggerDetailComponent,
    ConfiguratorComponent,
    ConfigureTriggerComponent,
    ConfigureSettingsComponent,
    TabsComponent,
    AutoCompleteDirective,
    AutoCompleteContentComponent,
    ActionButtonsComponent,
    ConfirmationComponent,
  ],
  exports: [
    ConfiguratorComponent
  ],
  providers: [
    ConfiguratorService,
    ConfigureDetailsService,
    SettingsFormBuilder,
  ],
  entryComponents: [
    AutoCompleteContentComponent,
    ConfirmationComponent,
  ]
})

export class ConfiguratorModule {
}
