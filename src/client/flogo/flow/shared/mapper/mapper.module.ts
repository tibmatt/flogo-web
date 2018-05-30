// import { AutoCompleteProvider } from './service/auto.complete.provider';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { TreeModule } from 'primeng/components/tree/tree';
import { MonacoEditorModule } from '../monaco-editor/monaco-editor.module';

import { MappingParser } from './services/map.parser';
// import { ScopedOutputSchemaProvider } from './service/map.output.schema.provider';
import { MapContextValidator } from './services/map.context.validator';
import { FunctionsComponent } from './functions-list/functions.component';
// import { ContextInputSchemaProvider } from './service/map.input.schema.provider';

import { EditorComponent } from './editor/editor.component';
import { MapperComponent } from './mapper.component';
import { InputListComponent } from './input-list/input-list.component';
import { OutputListComponent } from './output-list/output-list.component';
import { FunctionDetailsComponent } from './functions-list/function-details.component';
import { TreeComponent } from './tree/tree.component';
import { BreadcrumbsComponent } from './breadcrumbs/breadcrumbs.component';

import { TreeNodeFactoryService } from './services/tree-node-factory.service';
import { TreeService } from './services/tree.service';
import { IconsComponent } from './shared/icons.component';
import { InlineHrefDirective } from './shared/inline-href.directive';
import { IconsService } from './services/icons.service';
import { ClickOutsideDirective } from './shared/click-outside.directive';
import { ExpressionProcessorService } from './services/expression-processor.service';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild([]),
    PerfectScrollbarModule,
    TreeModule,
    MonacoEditorModule,
  ],
  exports: [
    FunctionsComponent,
    MapperComponent
  ],
  declarations: [
    EditorComponent,
    FunctionsComponent,
    MapperComponent,
    InputListComponent,
    OutputListComponent,
    FunctionDetailsComponent,
    IconsComponent,
    BreadcrumbsComponent,
    InlineHrefDirective,
    ClickOutsideDirective,
    TreeComponent
  ],
  entryComponents: [
    MapperComponent
  ],
  providers: [
    TreeNodeFactoryService,
    TreeService,
    IconsService,
    ExpressionProcessorService,

    MapContextValidator,
    MappingParser,
  ],
  bootstrap: []
})
export class MapperModule {

}
