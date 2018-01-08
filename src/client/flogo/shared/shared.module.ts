import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule as NgCommonModule } from '@angular/common';
import { Ng2Bs3ModalModule } from 'ng2-bs3-modal/ng2-bs3-modal';
import { TranslateModule } from 'ng2-translate/ng2-translate';

import { CopyToClipboardComponent } from './components';
import { TimeFromNowPipe } from './pipes';
import {
  AutofocusDirective,
  ContenteditableDirective,
  DraggableDirective,
  EditableInputDirective,
  JsonDownloaderDirective
} from './directives';
import { LoadingIndicatorComponent } from './components/loading-indicator.component';
import { ClickOutsideDirective } from './directives/click-outside.directive';
import { FlogoDeletePopupComponent } from './components/delete.popup.component';
import { ObjectPropertiesPipe } from './pipes/objectProperties.pipe';

const ALL_MODULE_DECLARABLES = [
  CopyToClipboardComponent,
  ContenteditableDirective,
  JsonDownloaderDirective,
  LoadingIndicatorComponent,
  AutofocusDirective,
  DraggableDirective,
  EditableInputDirective,
  TimeFromNowPipe,
  ClickOutsideDirective,
  FlogoDeletePopupComponent,
  ObjectPropertiesPipe
];

@NgModule({ // module dependencies
  imports: [
    NgCommonModule,
    TranslateModule,
  ],
  declarations: ALL_MODULE_DECLARABLES,
  exports: [
    NgCommonModule,
    // todo: should be in core only?
    FormsModule,
    ReactiveFormsModule,
    // todo: should be in root only?
    Ng2Bs3ModalModule,
    TranslateModule,
    ...ALL_MODULE_DECLARABLES,
  ]
})
export class SharedModule {
}
