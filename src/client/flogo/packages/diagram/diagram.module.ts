import { NgModule } from '@angular/core';
import { CoreModule } from '@flogo/core';
import { SharedModule } from '@flogo/shared';

import { DiagramComponent } from './diagram/diagram.component';
import { DiagramRowComponent } from './diagram/diagram-row.component';
import { TileInsertComponent } from './tiles/tile-insert.component';
import { TileTaskComponent } from './tiles/tile-task.component';
import { TileBranchComponent } from '@flogo/packages/diagram/tiles/tile-branch.component';

@NgModule({
  imports: [
    SharedModule,
    CoreModule,
  ],
  exports: [
    DiagramComponent,
  ],
  declarations: [
    DiagramComponent,
    DiagramRowComponent,
    TileInsertComponent,
    TileBranchComponent,
    TileTaskComponent,
  ],
  providers: [],
})
export class DiagramModule {
}
