import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MonacoLoaderService, SRC_PATH } from './monaco-loader.service';
import { MonacoEditorComponent } from './monaco-editor.component';


export interface ModuleConfig {
  pathToMonacoSrc?: string;
}

@NgModule({
  imports: [
    CommonModule,
  ],
  exports: [
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

  static forRoot(config: ModuleConfig = {}): ModuleWithProviders {
    return {
      ngModule: MonacoEditorModule,
      providers: [
        { provide: SRC_PATH, useValue: config.pathToMonacoSrc || '/assets/monaco/vs' }
      ],
    };
  }

}
