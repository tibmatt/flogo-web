import { Component } from '@angular/core';
import { AbstractTileTaskComponent } from '@flogo/packages/diagram/tiles/abstract-tile-task.component';
@Component({
  selector: 'flogo-diagram-tile-task',
  templateUrl: './tile-task.component.html',
  styleUrls: ['./tile-task.component.less']
})
export class TileTaskComponent extends AbstractTileTaskComponent {

  get isTerminal() {
    const { task } = this.tile;
    if (task) {
      return task.status.final || !task.capabilities.canHaveChildren;
    }
    return false;
  }

}
