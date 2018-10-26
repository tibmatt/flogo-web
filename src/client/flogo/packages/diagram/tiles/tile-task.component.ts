import {ChangeDetectionStrategy, Component} from '@angular/core';
import {AbstractTileTaskComponent} from './abstract-tile-task.component';
import {animate, style, transition, trigger} from '@angular/animations';


@Component({
  selector: 'flogo-diagram-tile-task',
  templateUrl: './tile-task.component.html',
  styleUrls: ['./tile-task.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [  trigger('menuOptions', [
    transition('void => *', [
      style({opacity: 0}),
      animate('250ms ease-in')
    ]),
    transition('* => void', [
      animate('250ms ease-in', style({ opacity: 0}))
    ]),
  ])]
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
    if (this.tile.isTerminalInRow) {
      return true;
    }
    const {task} = this.tile;
    if (task) {
      const {final: isFinal, canHaveChildren} = task.features;
      return isFinal || !canHaveChildren;
    }
    return false;
  }

  get errorMsg() {
    const status = this.tile.task.status;
    if (status && status.executionErrored) {
      const [error] = status.executionErrored;
      return error;
    }
    return null;
  }

}
