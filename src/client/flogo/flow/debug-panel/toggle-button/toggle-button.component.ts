import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'flogo-debug-panel-toggle-button',
  templateUrl: './toggle-button.component.html',
  styleUrls: ['./toggle-button.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToggleButtonComponent {
  @Input() isMinimized;
}
