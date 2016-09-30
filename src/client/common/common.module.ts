import { NgModule } from '@angular/core';
import { CommonModule as NgCommonModule } from '@angular/common';

import { CopyToClipboardComponent, InformationPopupComponent } from './components'
import { Contenteditable, JsonDownloader } from './directives';

const ALL_DECLARABLES = [
  CopyToClipboardComponent,
  InformationPopupComponent,
  Contenteditable,
  JsonDownloader
];

@NgModule({
  imports: [ NgCommonModule ],       // module dependencies
  declarations: ALL_DECLARABLES,
  exports: ALL_DECLARABLES
})
export class CommonModule { }
