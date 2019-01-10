import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule as NgCommonModule } from '@angular/common';
import { BsModalModule } from 'ng2-bs3-modal';
import { TranslateModule } from '@ngx-translate/core';

import { CopyToClipboardComponent } from './components';
import { TimeFromNowPipe, ObjectPropertiesPipe } from './pipes';
import {
  AutofocusDirective,
  ContenteditableDirective,
  DraggableDirective,
  EditableInputDirective,
  JsonDownloaderDirective,
  ClickOutsideDirective,
} from './directives';
import { LoadingIndicatorComponent, FlogoDeletePopupComponent } from './components';

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
  ObjectPropertiesPipe,
];

@NgModule({
  // module dependencies
  imports: [NgCommonModule, TranslateModule],
  declarations: ALL_MODULE_DECLARABLES,
  exports: [
    NgCommonModule,
    // todo: should be in core only?
    FormsModule,
    ReactiveFormsModule,
    // todo: should be in root only?
    BsModalModule,
    TranslateModule,
    ...ALL_MODULE_DECLARABLES,
  ],
})
export class SharedModule {}
