import { Component, EventEmitter, HostBinding, HostListener, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { DiagramSelection, TaskTile } from '../interfaces';
import { DiagramSelectionType } from '@flogo/packages/diagram/interfaces';

@Component({
  selector: 'flogo-diagram-tile-task',
  templateUrl: './tile-task.component.html',
  styleUrls: ['./tile-task.component.less']
})
export class TileTaskComponent implements OnChanges {
  @Input() tile: TaskTile;
  @Input() currentSelection: DiagramSelection;
  @Output() select = new EventEmitter<TaskTile>();
  @HostBinding('class.is-selected') isSelected = false;

  get isTerminal() {
    const { task } = this.tile;
    if (task) {
      return task.status.final || !task.capabilities.canHaveChildren;
    }
    return false;
  }

  ngOnChanges({ currentSelection: currentSelectionChange }: SimpleChanges) {
    if (currentSelectionChange) {
      this.checkIsSelected();
    }
  }

  onSelect() {
    this.select.emit(this.tile);
  }

  private checkIsSelected() {
    if (!this.currentSelection) {
      return false;
    }
    const {type, taskId} = this.currentSelection;
    this.isSelected = type === DiagramSelectionType.Node && taskId === this.tile.task.id;
  }

}
