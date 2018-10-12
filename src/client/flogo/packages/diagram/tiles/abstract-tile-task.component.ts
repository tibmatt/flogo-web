import { Injectable, EventEmitter, HostBinding, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { SvgRefFixerService } from '@flogo/core';
import { DiagramSelection, TaskTile, DiagramActionSelf, DiagramActionChild, DiagramSelectionType } from '../interfaces';
import { actionEventFactory } from '../action-event-factory';

@Injectable()
export abstract class AbstractTileTaskComponent implements OnChanges {
  @Input() tile: TaskTile;
  @Input() currentSelection: DiagramSelection;
  @Input() isReadOnly = false;
  @Output() select = new EventEmitter<TaskTile>();
  @Output() branch = new EventEmitter<DiagramActionChild>();
  @Output() remove = new EventEmitter<DiagramActionSelf>();
  @Output() configure = new EventEmitter<DiagramActionSelf>();
  @HostBinding('class.is-selected') isSelected = false;
  @HostBinding('class.tile-has-branch') hasBranch = false;
  displayMenuOptions: boolean;

  constructor(private svgFixer: SvgRefFixerService) {
    this.displayMenuOptions = false;
    this.hasBranch = false;
  }

  ngOnChanges({currentSelection: currentSelectionChange}: SimpleChanges) {
    if (currentSelectionChange) {
      this.checkIsSelected();
      if (!!this.tile.task.children.find(t => /^::branch::/.test(t))) {
        this.hasBranch = true;
      } else {
        this.hasBranch = false;
      }
    }
  }

  @HostBinding('class.has-run')
  get hasRun() {
    const status = this.tile.task.status;
    if (status) {
      return status.executed;
    }
    return false;
  }

  @HostBinding('class.is-invalid')
  get isInvalid() {
    const status = this.tile.task.status;
    if (status) {
      return status.invalid;
    }
    return false;
  }

  onSelect() {
    if (!this.isReadOnly) {
      this.select.emit(this.tile);
    }
  }

  OnMenuOptions(event) {
    event.stopPropagation();
    this.displayMenuOptions = true;
  }

  closeMenuOptions() {
    this.displayMenuOptions = false;
  }

  onRemove(event) {
    event.stopPropagation();
    this.remove.emit(actionEventFactory.remove(this.tile.task.id));
  }

  onBranch(event) {
    event.stopPropagation();
    this.branch.emit(actionEventFactory.branch(this.tile.task.id));
    this.hasBranch = true;
  }

  onConfigure(event) {
    event.stopPropagation();
    this.remove.emit(actionEventFactory.configure(this.tile.task.id));
  }

  protected fixSvgRef(ref: string) {
    return this.svgFixer.getFixedRef(ref);
  }

  private checkIsSelected() {
    this.isSelected = false;
    if (this.currentSelection) {
      const {type, taskId} = this.currentSelection;
      this.isSelected = type === DiagramSelectionType.Node && taskId === this.tile.task.id;
    }
  }

}
