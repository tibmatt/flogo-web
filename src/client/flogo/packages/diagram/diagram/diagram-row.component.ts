import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { Tile, TaskTile, InsertTile, TileType, DiagramAction, DiagramSelection } from '../interfaces';
import { actionEventFactory } from '../action-event-factory';
import { animate, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'flogo-diagram-row',
  templateUrl: './diagram-row.component.html',
  styleUrls: ['./diagram-row.component.less'],
  animations: [
    trigger('tasks', [
      transition(':enter', [
        style({ transform: 'scale(0.7)', opacity: 0 }),
        animate('0.3s cubic-bezier(.8,-0.6,0.2,1.5)',
          style({ transform: 'scale(1)', opacity: 1 }))
      ])
    ]),
  ],
})
export class DiagramRowComponent implements OnChanges {
  @Input() row: Tile[];
  @Input() selection: DiagramSelection;
  @Output() action = new EventEmitter<DiagramAction>();

  tileTypes = TileType;
  tiles: Tile[];

  trackTileBy(index, tile: Tile) {
    if (tile.type === TileType.Task) {
      return (<TaskTile>tile).task.parents[0];
    } else if (tile.type === TileType.Insert) {
      return (<InsertTile>tile).parentId;
    } else {
      return tile.type;
    }
  }

  ngOnChanges({ row: rowChange }: SimpleChanges) {
    if (rowChange) {
      this.tiles = [...this.row].reverse();
    }
  }

  onInsertSelected(parentId: string) {
    this.action.emit(actionEventFactory.insert(parentId));
  }

  onTaskSelected(taskTile: TaskTile) {
    this.action.emit(actionEventFactory.select(taskTile.task.id));
  }

}
