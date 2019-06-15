import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'demo-context-panel',
  templateUrl: './context-panel.component.html',
  styleUrls: ['./context-panel.component.less'],
})
export class ContextPanelComponent {
  isOpen: boolean;

  setPanelState(isOpen: boolean) {
    this.isOpen = isOpen;
  }
}
