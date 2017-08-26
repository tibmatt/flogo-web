import {Component, Input} from '@angular/core';

@Component({
  selector: 'flogo-transform-error-display',
  // moduleId: module.id,
  templateUrl: 'error-display.tpl.html',
  styleUrls: ['error-display.component.less']
})
export class ErrorDisplayComponent {
  @Input() errors: any = {};
}
