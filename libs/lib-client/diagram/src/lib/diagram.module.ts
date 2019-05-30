import { NgModule } from '@angular/core';
import { LanguageModule } from '@flogo-web/lib-client/language';
import { CommonModule } from '@angular/common';

import { DiagramComponent } from './diagram/diagram.component';
import { DiagramRowComponent } from './diagram/diagram-row.component';
import { TileInsertComponent } from './tiles/tile-insert.component';
import { TileTaskComponent } from './tiles/tile-task.component';

import { TileBranchComponent } from './tiles/tile-branch.component';
import { StreamDiagramComponent } from './diagram/stream-diagram.component';
import { StreamDiagramRowComponent } from './diagram/stream-diagram-row.component';
import { StreamTileTaskComponent } from './tiles/stream-tile-task.component';

@NgModule({
  imports: [CommonModule, LanguageModule],
  exports: [DiagramComponent, StreamDiagramComponent],
  declarations: [
    DiagramComponent,
    StreamDiagramComponent,
    DiagramRowComponent,
    StreamDiagramRowComponent,
    TileInsertComponent,
    StreamTileTaskComponent,
    TileBranchComponent,
    TileTaskComponent,
  ],
  providers: [],
})
export class DiagramModule {}
