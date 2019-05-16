import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'flogo-stream-designer',
  templateUrl: './stream-designer.component.html',
  styleUrls: ['./stream-designer.component.less'],
})
export class StreamDesignerComponent implements OnInit {
  isPanelOpen = false;

  constructor() {}

  ngOnInit() {}

  togglePanel() {
    this.isPanelOpen = !this.isPanelOpen;
  }
}
