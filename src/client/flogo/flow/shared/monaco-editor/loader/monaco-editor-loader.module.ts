import { NgModule, NgZone } from '@angular/core';
import { MonacoEditorLoaderService, factory } from './monaco-editor-loader.service';
import { MonacoEditorLoaderDirective } from './monaco-editor-loader.directive';

// from https://github.com/leolorenzoluis/xyz.MonacoEditorLoader
// not using library directly as it is incompatible with angular 2.x
@NgModule({
  declarations: [
    MonacoEditorLoaderDirective
  ],
  exports: [MonacoEditorLoaderDirective],
  providers: [
    {
      provide: MonacoEditorLoaderService,
      deps: [NgZone],
      useFactory: factory
    }
  ]
})
export class MonacoEditorLoaderModule { }
