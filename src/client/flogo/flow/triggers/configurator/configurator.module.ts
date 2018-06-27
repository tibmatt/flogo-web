import {NgModule} from '@angular/core';
import { ReactiveFormsModule} from '@angular/forms';
import { CommonModule as NgCommonModule } from '@angular/common';
import { ScrollDispatchModule } from '@angular/cdk/scrolling';
import { OverlayModule } from '@angular/cdk/overlay';
import { PortalModule } from '@angular/cdk/portal';

import {SharedModule as FlogoSharedModule} from '@flogo/shared';
import {MapperModule} from '@flogo/flow/shared/mapper';

import { MonacoEditorModule } from '../../shared/monaco-editor';
import {ConfiguratorService} from './services/configurator.service';
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
  SettingsHelpComponent,
  SettingsFormFieldComponent
} from './trigger-detail';
import { FieldValueAccesorDirective } from './trigger-detail/settings/field.directive';

@NgModule({
  imports: [
    NgCommonModule,
    ReactiveFormsModule,
    ScrollDispatchModule,
    OverlayModule,
    PortalModule,
    FlogoSharedModule,
    MapperModule,
    MonacoEditorModule,
  ],
  declarations: [
    TriggerDetailComponent,
    ConfiguratorComponent,
    ConfigureTriggerComponent,
    ConfigureSettingsComponent,
    TabsComponent,
    AutoCompleteDirective,
    FieldValueAccesorDirective,
    AutoCompleteContentComponent,
    ActionButtonsComponent,
    ConfirmationComponent,
    SettingsHelpComponent,
    SettingsFormFieldComponent
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
