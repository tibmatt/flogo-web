import {Component, Input} from 'angular2/core';

@Component({
  selector: 'flogo-transform-error-display',
  moduleId: module.id,
  templateUrl: 'error-display.tpl.html'
})
export class ErrorDisplayComponent {
  @Input() errors : any = {};
}
