import { NgModule } from '@angular/core';
import { CoreModule } from '@flogo-web/client/core';
import { SharedModule } from '@flogo-web/client-shared';

import { DiagramComponent } from './diagram/diagram.component';
import { DiagramRowComponent } from './diagram/diagram-row.component';
import { TileInsertComponent } from './tiles/tile-insert.component';
import { TileTaskComponent } from './tiles/tile-task.component';

import { TileBranchComponent } from './tiles/tile-branch.component';

@NgModule({
  imports: [SharedModule, CoreModule],
  exports: [DiagramComponent],
  declarations: [
    DiagramComponent,
    DiagramRowComponent,
    TileInsertComponent,
    TileBranchComponent,
    TileTaskComponent,
  ],
  providers: [],
})
export class DiagramModule {}
