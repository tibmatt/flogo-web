import { Component } from '@angular/core';
import { AbstractTileTaskComponent } from '@flogo/packages/diagram/tiles/abstract-tile-task.component';
@Component({
  selector: 'flogo-diagram-tile-task',
  templateUrl: './tile-task.component.html',
  styleUrls: ['./tile-task.component.less']
})
export class TileTaskComponent extends AbstractTileTaskComponent {

  get bgFill() {
    if (this.hasRun) {
      return this.fixSvgRef('url(#flogo-diagram-tile__bg--has-run)');
    } else if (this.isSelected) {
      return '#4e7ead';
    } else {
      return this.fixSvgRef('url(#flogo-diagram-tile__bg)');
    }
  }

  get shadow() {
    if (this.isSelected) {
      return this.fixSvgRef('url(#flogo-diagram-tile__shadow--active)');
    } else {
      return this.fixSvgRef('url(#flogo-diagram-tile__shadow)');
    }
  }

  get isTerminal() {
    const { task } = this.tile;
    if (task) {
      return task.status.final || !task.capabilities.canHaveChildren;
    }
    return false;
  }

}
