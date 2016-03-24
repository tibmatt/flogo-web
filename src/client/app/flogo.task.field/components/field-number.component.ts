import {Component} from 'angular2/core';
import {ROUTER_DIRECTIVES} from 'angular2/router';

@Component({
  selector: 'flogo-task-field-number',
  moduleId: module.id,
  templateUrl: '<input type="number" />',
  directives: [ROUTER_DIRECTIVES]
})

export class FlogoTaskFieldNumberComponent{
}
