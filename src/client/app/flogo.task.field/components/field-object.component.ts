import {Component} from 'angular2/core';
import {ROUTER_DIRECTIVES} from 'angular2/router';
import {FlogoTaskFieldBaseComponent}  from './field-base.component'

@Component({
  selector: 'flogo-task-field-object',
  styleUrls: ['task-field.css'],
  moduleId: module.id,
  templateUrl: 'field-object.tpl.html',
  directives: [ROUTER_DIRECTIVES]
})

export class FlogoTaskFieldObjectComponent extends FlogoTaskFieldBaseComponent{

  exportToJson() {
    var value:any;
    try {
      value = JSON.parse(this.value);
    } catch(exc) {
      value = {};
    }
    return {
      "name": this.schema.name,
      "value": value
    }

  }

}
