import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { StreamDesignerComponent } from './stream-designer/stream-designer.component';

@NgModule({
  imports: [
    CommonModule,

    RouterModule.forChild([
      { path: '', pathMatch: 'full', component: StreamDesignerComponent },
    ]),
  ],
  declarations: [StreamDesignerComponent],
})
export class StreamClientModule {}
