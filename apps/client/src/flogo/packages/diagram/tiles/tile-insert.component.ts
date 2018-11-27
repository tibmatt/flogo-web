import { ChangeDetectionStrategy, Component, EventEmitter, HostBinding, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { DiagramSelection, InsertTile, DiagramSelectionType } from '../interfaces';
import {BUTTON_INSERT_CLASS, SELECTED_INSERT_TILE_CLASS} from '@flogo-web/client/core';

@Component({
  selector: 'flogo-diagram-tile-insert',
  templateUrl: './tile-insert.component.html',
  styleUrls: ['./tile-insert.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TileInsertComponent implements OnChanges {
  @Input() tile: InsertTile;
  @Input() currentSelection: DiagramSelection;
  @Output() select = new EventEmitter<string>();
  @HostBinding('class.is-selected')
  @HostBinding(`class.${SELECTED_INSERT_TILE_CLASS}`)
  isSelected = false;
  btnInsertClass = BUTTON_INSERT_CLASS;

  ngOnChanges({ currentSelection: currentSelectionChange }: SimpleChanges) {
    if (currentSelectionChange) {
      this.isSelected = this.checkIsSelected();
    }
  }

  onClick() {
    this.select.emit(this.tile.parentId);
  }

  @HostBinding('class.is-root')
  get isRootInsert() {
    return this.tile && this.tile.isRoot;
  }

  private checkIsSelected() {
    if (!this.currentSelection) {
      return false;
    }
    const {type, taskId, diagramId} = this.currentSelection;
    const forRoot = this.isRootInsert;
    return type === DiagramSelectionType.Insert && (taskId && taskId === this.tile.parentId || forRoot);
  }
}
