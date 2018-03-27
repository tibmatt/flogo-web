import { Component, Input } from '@angular/core';
import { DiagramSelection, TaskTile } from '../interfaces';

@Component({
  selector: 'flogo-diagram-tile-task',
  templateUrl: './tile-task.component.html',
  styleUrls: ['./tile-task.component.less']
})
export class TileTaskComponent {
  @Input() tile: TaskTile;
  @Input() currentSelection: DiagramSelection;
}
