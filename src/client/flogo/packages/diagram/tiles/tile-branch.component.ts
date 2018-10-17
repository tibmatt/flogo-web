import {ChangeDetectorRef, Component, HostBinding, Input, OnChanges, SimpleChanges} from '@angular/core';
import {SvgRefFixerService} from '@flogo/core';
import {AbstractTileTaskComponent} from './abstract-tile-task.component';

const ROW_HEIGHT = 122;
const BOTTOM_DISTANCE = 30;
const TILE_HEIGHT = 60;

@Component({
  selector: 'flogo-diagram-tile-branch',
  templateUrl: './tile-branch.component.html',
  styleUrls: ['./tile-branch.component.less']
})
export class TileBranchComponent extends AbstractTileTaskComponent implements OnChanges {
  @Input() spanRows: number;
  currentSpanRows: number;
  displayBranchOptions = false;

  constructor(svgFixer: SvgRefFixerService, private changeDetector: ChangeDetectorRef) {
    super(svgFixer);
  }

  ngOnChanges(changes: SimpleChanges) {
    super.ngOnChanges(changes);
    const {spanRows: spanRowsChange} = changes;
    if (!spanRowsChange) {
      return;
    }
    if (spanRowsChange.previousValue < spanRowsChange.currentValue) {
      // allow for parent animation to complete
      setTimeout(() => {
        this.applySpanRowsUpdate();
        this.changeDetector.detectChanges();
      }, 400); // same as transition time
    } else {
      this.applySpanRowsUpdate();
    }
  }

  get containerHeight() {
    return ROW_HEIGHT * this.currentSpanRows;
  }

  get branchHeight() {
    return this.containerHeight + (TILE_HEIGHT / 2) - BOTTOM_DISTANCE;
  }

  get branchPosition() {
    return BOTTOM_DISTANCE - this.containerHeight;
  }

  get tilesConnectorPosition() {
    return BOTTOM_DISTANCE - (TILE_HEIGHT / 2) - this.containerHeight;
  }

  onBranchOptions(event) {
    event.stopPropagation();
    this.displayBranchOptions = !this.displayBranchOptions;
  }

  closeBranchOptions() {
    this.displayBranchOptions = false;
  }

  private applySpanRowsUpdate() {
    this.currentSpanRows = this.spanRows;
  }

}
