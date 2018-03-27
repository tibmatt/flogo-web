import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DiagramComponent } from './diagram/diagram.component';
import { DiagramRowComponent } from './diagram/diagram-row.component';
import { TilePlaceholderComponent } from './tiles/tile-placeholder.component';
import { TileEmptyComponent } from './tiles/tile-empty.component';
import { DiagramTestComponent } from '@flogo/packages/diagram/diagram-test.component';
import { TileInsertComponent } from './tiles/tile-insert.component';
import { TileTaskComponent } from './tiles/tile-task.component';

@NgModule({
  imports: [
    CommonModule
  ],
  exports: [],
  declarations: [
    DiagramComponent,
    DiagramRowComponent,
    TileEmptyComponent,
    TileInsertComponent,
    TilePlaceholderComponent,

    DiagramTestComponent,

    TileTaskComponent,
  ],
  providers: [],
})
export class DiagramModule {
}
