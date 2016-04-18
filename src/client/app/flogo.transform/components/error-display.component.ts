import {Component, Input} from 'angular2/core';

@Component({
  selector: 'flogo-transform-error-display',
  moduleId: module.id,
  templateUrl: 'error-display.tpl.html',
  styleUrls: ['error-display.component.css']
})
export class ErrorDisplayComponent {
  @Input() errors : any = {};
}
