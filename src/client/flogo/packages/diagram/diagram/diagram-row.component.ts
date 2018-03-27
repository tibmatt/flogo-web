import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Tile, TaskTile, TileType, DiagramAction, DiagramSelection } from '../interfaces';
import { actionEventFactory } from '../action-event-factory';

@Component({
  selector: 'flogo-diagram-row',
  templateUrl: './diagram-row.component.html',
  styleUrls: ['./diagram-row.component.less']
})
export class DiagramRowComponent {
  @Input() row: Tile[];
  @Input() selection: DiagramSelection;
  @Output() action = new EventEmitter<DiagramAction>();

  tileTypes = TileType;

  trackTileBy(index, tile: Tile) {
    if (tile.type === TileType.Task) {
      return (<TaskTile>tile).task.id;
    } else {
      return tile.type;
    }
  }

  onInsertSelected(parentId: string) {
    this.action.emit(actionEventFactory.insert(parentId));
  }
}
