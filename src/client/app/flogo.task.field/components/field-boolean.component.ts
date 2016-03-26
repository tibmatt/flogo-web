import {Component} from 'angular2/core';
import {ROUTER_DIRECTIVES} from 'angular2/router';
import {FlogoTaskFieldBaseComponent}  from './field-base.component'

@Component({
  selector: 'flogo-task-field-boolean',
  styleUrls: ['task-field.css'],
  moduleId: module.id,
  templateUrl: 'field-boolean.tpl.html',
  directives: [ROUTER_DIRECTIVES]
})

export class FlogoTaskFieldBooleanComponent extends FlogoTaskFieldBaseComponent{


}
