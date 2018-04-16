import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'flogo-diagram-tile-empty',
  template: '',
  styleUrls: ['./tile-empty.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TileEmptyComponent {
}
