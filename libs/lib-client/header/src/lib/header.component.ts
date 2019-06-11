import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'flogo-designer-header',
  templateUrl: 'header.component.html',
  styleUrls: ['header.component.less'],
})
export class HeaderComponent {
  @Input()
  name: string;
  @Input()
  appName: string;
  @Input()
  description: string;
  @Output()
  goBack: EventEmitter<null> = new EventEmitter();
  @Output()
  changeName: EventEmitter<string> = new EventEmitter();
  @Output()
  changeDescription: EventEmitter<string> = new EventEmitter();
  isHoveredOnBack = false;

  onMouseOverBackControl() {
    this.isHoveredOnBack = true;
  }

  onMouseOutBackControl() {
    this.isHoveredOnBack = false;
  }
}
