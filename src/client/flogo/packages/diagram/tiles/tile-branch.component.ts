import { Component, HostBinding, Input } from '@angular/core';
import { AbstractTileTaskComponent } from '@flogo/packages/diagram/tiles/abstract-tile-task.component';

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
export class TileBranchComponent extends AbstractTileTaskComponent {
  @Input() spanRows: number;
  @HostBinding('class.is-hovered') isHovered = false;

  setHovered(isHovered: boolean) {
    this.isHovered = isHovered;
  }

  get path() {
    const height = this.getBranchHeight();
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
    return ROW_HEIGHT * this.spanRows;
  }

  get transform() {
    const translateX = 100 + ACTIVE_STATE.HORIZONTAL_SHADOW_OFFSET;
    const translateY = this.getBranchHeight();
    return `translate(${translateX}, ${translateY}) rotate(180)`;
  }

  private getBranchHeight() {
    return this.containerHeight - BOTTOM_DISTANCE;
  }

}
