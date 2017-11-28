import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MonacoEditorLoaderModule } from './loader';
import { MonacoEditorComponent } from './monaco-editor.component';

export interface ModuleConfig {
  pathToMonacoSrc?: string;
}

@NgModule({
  imports: [
    CommonModule,
    MonacoEditorLoaderModule,
  ],
  exports: [
    MonacoEditorLoaderModule,
    MonacoEditorComponent,
  ],
  declarations: [
    MonacoEditorComponent,
  ],
  providers: [
    // MonacoLoaderService,
  ]
})
export class MonacoEditorModule {
}
