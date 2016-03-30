import {Component} from 'angular2/core';
import {ROUTER_DIRECTIVES} from 'angular2/router';
import {FlogoTaskFieldBaseComponent}  from './field-base.component'

@Component({
  selector: 'flogo-task-field-number',
  styleUrls: ['task-field.css'],
  moduleId: module.id,
  templateUrl: 'field-number.tpl.html',
  directives: [ROUTER_DIRECTIVES]
})

export class FlogoTaskFieldNumberComponent extends FlogoTaskFieldBaseComponent{

}