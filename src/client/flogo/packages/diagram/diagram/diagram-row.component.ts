import { Component, EventEmitter, HostBinding, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { animate, style, transition, trigger } from '@angular/animations';
import { Tile, TaskTile, TileType, NodeType, DiagramAction, DiagramSelection } from '../interfaces';
import { actionEventFactory } from '../action-event-factory';
import { RowIndexService, isTaskTile, isInsertTile } from '../shared';

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
      ]),
      transition(':leave', [
        style({ transform: 'scale(1)', opacity: 1 }),
        animate('0.3s cubic-bezier(.8,-0.6,0.2,1.5)',
          style({ transform: 'scale(0.7)', opacity: 0 }))
      ])
    ]),
    trigger('inserts', [
      transition(':leave', [
        style({ opacity: 1, position: 'relative', zIndex: '-1' }),
        animate('0s cubic-bezier(.8,-0.6,0.2,1.5)',
          style({ opacity: 0 }))
      ])
    ]),
    trigger('branches', [
      transition(':enter', [
        style({ transform: 'translateY(-50%) scale(0.7)', opacity: 0 }),
        animate('0.3s cubic-bezier(.8,-0.6,0.2,1.5)',
          style({ transform: 'translateY(0) scale(1)', opacity: 1 }))
      ]),
      transition(':leave', [
        style({ transform: 'scale(1)', opacity: 1 }),
        animate('0.3s cubic-bezier(.8,-0.6,0.2,1.5)',
          style({ transform: 'scale(0.7)', opacity: 0 }))
      ])
    ]),
  ],
})
export class DiagramRowComponent implements OnChanges {
  @Input() row: Tile[];
  @Input() selection: DiagramSelection;
  @Input() rowIndex: number;
  @HostBinding('class.is-readonly') @Input() isReadOnly = false;
  @Output() action = new EventEmitter<DiagramAction>();

  tileTypes = TileType;
  nodeTypes = NodeType;
  tiles: Tile[];

  constructor(private rowIndexService: RowIndexService) {
  }

  trackTileBy(index, tile: Tile) {
    if (isTaskTile(tile)) {
      return tile.task.id;
    } else if (isInsertTile(tile)) {
        return `insert::${tile.parentId}`;
    } else {
      return tile.type;
    }
  }

  ngOnChanges({ row: rowChange }: SimpleChanges) {
    if (rowChange) {
      this.tiles = [...this.row].reverse();
    }
  }

  calculateBranchSpan(taskTile: TaskTile) {
    const [parentId] = taskTile.task.parents;
    const parentRowIndex = this.rowIndexService.getRowIndexForTask(parentId);
    return this.rowIndex - parentRowIndex;
  }

  onInsertSelected(parentId: string) {
    this.action.emit(actionEventFactory.insert(parentId));
  }

  onTaskSelected(taskTile: TaskTile) {
    this.action.emit(actionEventFactory.select(taskTile.task.id));
  }

  onTaskAction(action: DiagramAction) {
    this.action.emit(action);
  }

  onBranchRemove(taskTile: TaskTile) {
    this.action.emit(actionEventFactory.remove(taskTile.task.id));
  }

}
