import {
  ChangeDetectionStrategy, Component, EventEmitter, HostBinding, Input, OnChanges, OnDestroy, Output,
  SimpleChanges
} from '@angular/core';
import { find } from 'lodash';
import { Flow, DiagramSelection, DiagramAction, TaskTile, TileType, Tile } from '../interfaces';
import { TileMatrix, makeRenderableMatrix } from '../renderable-model';
import { RowIndexService } from '../shared/row-index.service';
import { diagramAnimations } from './diagram.animations';

@Component({
  // temporal name until old diagram implementation is removed
  selector: 'flogo-diagram-v2',
  templateUrl: './diagram.component.html',
  styleUrls: ['./diagram.component.less'],
  providers: [RowIndexService],
  animations: diagramAnimations,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DiagramComponent implements OnChanges, OnDestroy {
  @HostBinding('@list') animateList = true;
  @Input() flow: Flow;
  @Input() selection: DiagramSelection;
  @Input() @HostBinding('class.flogo-diagram-is-readonly') isReadOnly = false;
  @Output() action = new EventEmitter<DiagramAction>();
  tileMatrix: TileMatrix;

  constructor(private rowIndexService: RowIndexService) {
  }

  ngOnChanges({ flow: flowChange, isReadOnly: readOnlyChange }: SimpleChanges) {
    const readOnlyDidChange = readOnlyChange && readOnlyChange.currentValue !== readOnlyChange.previousValue;
    if (flowChange || readOnlyDidChange) {
      const tileMatrix = makeRenderableMatrix(this.flow, 7, this.isReadOnly);
      this.rowIndexService.updateRowIndexes(tileMatrix);
      this.tileMatrix = tileMatrix.reverse();
    }
  }

  ngOnDestroy() {
    this.rowIndexService.clear();
  }

  onAction(action: DiagramAction) {
    this.action.emit(action);
  }

  trackRow(index, row: Tile[]) {
    const firstTask = <TaskTile>find(row, tile => tile.type === TileType.Task);
    if (firstTask) {
      return firstTask.task.id;
    } else {
      return index;
    }
  }

}
