import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'flogo-flow-debug-panel-detail',
  templateUrl: './debug-panel-detail.component.html',
  styleUrls: ['./debug-panel-detail.component.less']
})
export class DebugPanelDetailComponent {

  @Output() close = new EventEmitter();

  onClose() {
    this.close.emit();
  }

}
