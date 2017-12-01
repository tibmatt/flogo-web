import { Component, EventEmitter, Input, Output } from '@angular/core';
@Component({
  selector: 'flogo-mapper-mode-switcher',
  templateUrl: './mode-switcher.component.html',
  styleUrls: ['./mode-switcher.component.less']
})
export class ModeSwitcherComponent {
  @Input() checked: boolean;
  @Output() click = new EventEmitter();

  onClick(event) {
    this.click.next(event);
  }

}
