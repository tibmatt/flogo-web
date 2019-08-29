import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DiagramModule } from '@flogo-web/lib-client/diagram';
import { MainComponent } from './main/main.component';
import { MonacoEditorModule } from './shared/monaco-editor';

@NgModule({
  imports: [
    CommonModule,
    DiagramModule,
    RouterModule.forChild([{ path: '', pathMatch: 'full', component: MainComponent }]),
    MonacoEditorModule.forRoot(),
  ],
  declarations: [MainComponent],
})
export class OrganicClientModule {}
