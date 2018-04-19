import { ChangeDetectorRef, Component, HostBinding, Input, OnChanges, SimpleChanges } from '@angular/core';
import { AbstractTileTaskComponent } from '@flogo/packages/diagram/tiles/abstract-tile-task.component';
import { SvgRefFixerService } from '@flogo/core/services/svg-ref-fixer.service';

const ROW_HEIGHT = 140;
const BOTTOM_DISTANCE = 35;

const ACTIVE_STATE = {
  VERTICAL_SHADOW_OFFSET: 35,
  HORIZONTAL_SHADOW_OFFSET: 20,
};

@Component({
  selector: 'flogo-diagram-tile-branch',
  templateUrl: './tile-branch.component.html',
  styleUrls: ['./tile-branch.component.less']
})
export class TileBranchComponent extends AbstractTileTaskComponent implements OnChanges {
  @Input() spanRows: number;
  @HostBinding('class.is-hovered') isHovered = false;
  currentSpanRows: number;

  constructor(svgFixer: SvgRefFixerService, private changeDetector: ChangeDetectorRef) {
    super(svgFixer);
  }

  setHovered(isHovered: boolean) {
    this.isHovered = isHovered;
  }

  ngOnChanges(changes: SimpleChanges) {
    super.ngOnChanges(changes);
    const { spanRows: spanRowsChange } = changes;
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

  get path() {
    const height = this.getBranchHeight() - 1; // give some space for the shadow
    return `M 90 37 L 90 26 C 90 12 78 0 64 0 L 7 0 L 0 14 L 7 28 L 52 28 C 57 28 62 32 62 37
      L 62 ${height}
      L 90 ${height}
      L 90 37 L 90 37 Z`;
  }

  get viewBox() {
    const viewBoxHeight = this.containerHeight;
    return `0 0 128 ${viewBoxHeight}`;
  }

  get containerHeight() {
    return ROW_HEIGHT * this.currentSpanRows;
  }

  get transform() {
    const translateX = 100 + ACTIVE_STATE.HORIZONTAL_SHADOW_OFFSET;
    const translateY = this.getBranchHeight();
    return `translate(${translateX}, ${translateY}) rotate(180)`;
  }

  get bgFill() {
    if (this.hasRun) {
      return this.fixSvgRef('url(#flogo-diagram-tile__bg--has-run)');
    } else if (this.isSelected) {
      return '#8a90ae';
    } else {
      return this.fixSvgRef('url(#flogo-diagram-branch__bg)');
    }
  }

  get shadow() {
    if (this.isSelected) {
      return this.fixSvgRef('url(#flogo-diagram-branch__shadow--active)');
    } else {
      return this.fixSvgRef('url(#flogo-diagram-branch__shadow)');
    }
  }

  private getBranchHeight() {
    return this.containerHeight - BOTTOM_DISTANCE;
  }

  private applySpanRowsUpdate() {
    this.currentSpanRows = this.spanRows;
  }

}
