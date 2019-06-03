import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostBinding,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';

import { NodeType } from '@flogo-web/lib-client/core';

import { Tile, TaskTile, TileType, DiagramAction, DiagramSelection } from '../interfaces';
import { actionEventFactory } from '../action-event-factory';
import { RowIndexService, isTaskTile, isInsertTile } from '../shared';
import { rowAnimations } from './diagram-row.animations';

@Component({
  selector: 'flogo-diagram-stream-row',
  templateUrl: './stream-diagram-row.component.html',
  styleUrls: ['./stream-diagram-row.component.less'],
  animations: rowAnimations,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StreamDiagramRowComponent implements OnChanges {
  @Input() row: Tile[];
  @Input() selection: DiagramSelection;
  @Input() rowIndex: number;
  @HostBinding('class.is-readonly') @Input() isReadOnly = false;
  @Output() action = new EventEmitter<DiagramAction>();

  tileTypes = TileType;
  nodeTypes = NodeType;
  tiles: Tile[];

  constructor(private rowIndexService: RowIndexService) {}

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
      this.tiles = this.row;
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
}
